"""Drives the vendored chess-game-engine's `uci.py` as a one-shot subprocess.

Stateless per request: spawn -> handshake -> position -> go -> bestmove -> quit.
Mirrors the handshake/send/wait/parse pattern of that repo's own uci_client.py
(UciSubprocessEngine), which is used there to drive the same engine from its Pygame
GUI. We don't reuse that class directly since it's a persistent-session client and
this needs to guarantee the subprocess is torn down after exactly one move.
"""

import re
import subprocess
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path

from app.difficulty import DIFFICULTY_MAP

ENGINE_DIR = Path(__file__).resolve().parent.parent / "vendor" / "chess-game-engine"

# board.py's notation module returns this for "no legal move" (checkmate/stalemate).
NULL_MOVE = "0000"

UCIOK_TIMEOUT_S = 5.0
# Buffer added to the requested search time to cover interpreter/import startup and
# the handshake round-trip, not just the search itself.
STARTUP_BUFFER_S = 3.0
HARD_CEILING_S = 15.0

REJECTED_MOVE_RE = re.compile(r"^info string ignoring unplayable move: (\S+)$")


class EngineError(Exception):
    pass


class IllegalMoveError(EngineError):
    def __init__(self, rejected: list[str]):
        self.rejected = rejected
        super().__init__(f"engine rejected moves: {rejected}")


class EngineTimeoutError(EngineError):
    pass


class EngineCrashedError(EngineError):
    pass


@dataclass
class SearchInfo:
    depth: int = 0
    seldepth: int = 0
    score_cp: int | None = None
    score_mate: int | None = None
    nodes: int = 0
    nps: int = 0
    time_ms: int = 0
    pv: list[str] = field(default_factory=list)


@dataclass
class EngineMoveResult:
    bestmove: str | None
    info: SearchInfo | None


class _EngineProcess:
    """One `python uci.py` child process plus a background stdout reader."""

    def __init__(self):
        self.proc = subprocess.Popen(
            ["python3", "-u", "uci.py"],
            cwd=str(ENGINE_DIR),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        self._lines: list[str] = []
        self._lock = threading.Lock()
        threading.Thread(target=self._read_stdout, daemon=True).start()

    def _read_stdout(self) -> None:
        assert self.proc.stdout is not None
        try:
            for line in self.proc.stdout:
                with self._lock:
                    self._lines.append(line.rstrip("\n"))
        except Exception:
            pass

    def snapshot(self) -> list[str]:
        with self._lock:
            return list(self._lines)

    def send(self, cmd: str) -> None:
        if self.proc.poll() is not None:
            raise EngineCrashedError(f"engine exited before accepting {cmd!r}")
        assert self.proc.stdin is not None
        self.proc.stdin.write(cmd + "\n")
        self.proc.stdin.flush()

    def wait_for(self, predicate, timeout_s: float) -> str | None:
        deadline = time.monotonic() + timeout_s
        seen = 0
        while True:
            lines = self.snapshot()
            for line in lines[seen:]:
                if predicate(line):
                    return line
            seen = len(lines)
            if self.proc.poll() is not None:
                return None
            if time.monotonic() >= deadline:
                return None
            time.sleep(0.005)

    def close(self) -> None:
        try:
            if self.proc.poll() is None:
                try:
                    self.send("quit")
                except EngineCrashedError:
                    pass
            self.proc.wait(timeout=2)
        except Exception:
            self.proc.kill()
            try:
                self.proc.wait(timeout=2)
            except Exception:
                pass


def _parse_info_line(line: str) -> SearchInfo:
    """Parses a line as emitted by uci_protocol.py's `_send_info`:

    "info depth D seldepth S score cp C|score mate M nodes N nps NPS time T
    hashfull H [pv ...]" -- `pv`, when present, is always last and consumes the
    remainder of the line.
    """
    tokens = line.split()
    info = SearchInfo()
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok == "depth":
            info.depth = int(tokens[i + 1])
            i += 2
        elif tok == "seldepth":
            info.seldepth = int(tokens[i + 1])
            i += 2
        elif tok == "score":
            kind, value = tokens[i + 1], int(tokens[i + 2])
            if kind == "mate":
                info.score_mate = value
            else:
                info.score_cp = value
            i += 3
        elif tok == "nodes":
            info.nodes = int(tokens[i + 1])
            i += 2
        elif tok == "nps":
            info.nps = int(tokens[i + 1])
            i += 2
        elif tok == "time":
            info.time_ms = int(tokens[i + 1])
            i += 2
        elif tok == "pv":
            info.pv = tokens[i + 1:]
            break
        else:
            i += 1
    return info


def get_engine_move(moves: list[str], difficulty: str) -> EngineMoveResult:
    """Plays `moves` from the start position and returns the engine's reply.

    Raises IllegalMoveError, EngineTimeoutError, or EngineCrashedError on failure.
    The subprocess is always torn down before this returns, one way or another.
    """
    movetime_ms = DIFFICULTY_MAP[difficulty]["movetime_ms"]
    engine = _EngineProcess()
    try:
        engine.send("uci")
        if engine.wait_for(lambda l: l == "uciok", UCIOK_TIMEOUT_S) is None:
            raise EngineCrashedError("engine did not answer uciok")

        pos_cmd = "position startpos"
        if moves:
            pos_cmd += " moves " + " ".join(moves)
        before = len(engine.snapshot())
        engine.send(pos_cmd)

        # `position` is handled synchronously (no search thread involved), so a brief
        # settle is enough to observe any "ignoring unplayable move" warnings before
        # sending `go`.
        time.sleep(0.05)
        rejected = [
            m.group(1)
            for line in engine.snapshot()[before:]
            if (m := REJECTED_MOVE_RE.match(line))
        ]
        if rejected:
            raise IllegalMoveError(rejected)

        engine.send(f"go movetime {movetime_ms}")
        deadline_s = min(movetime_ms / 1000.0 + STARTUP_BUFFER_S, HARD_CEILING_S)
        bestmove_line = engine.wait_for(lambda l: l.startswith("bestmove"), deadline_s)
        if bestmove_line is None:
            if engine.proc.poll() is not None:
                raise EngineCrashedError("engine exited before producing a bestmove")
            raise EngineTimeoutError(f"no bestmove within {deadline_s:.1f}s")

        bestmove_token = bestmove_line.split()[1]

        info = None
        for line in reversed(engine.snapshot()):
            if line.startswith("info depth"):
                info = _parse_info_line(line)
                break

        bestmove = None if bestmove_token == NULL_MOVE else bestmove_token
        return EngineMoveResult(bestmove=bestmove, info=info)
    finally:
        engine.close()
