import pytest

from app.engine_client import IllegalMoveError, get_engine_move


def test_opening_move_is_legal_and_fast():
    result = get_engine_move([], "beginner")
    assert result.bestmove is not None
    assert len(result.bestmove) in (4, 5)
    assert result.info is not None
    assert result.info.depth >= 1


def test_engine_replies_to_its_own_moves_for_several_plies():
    moves: list[str] = []
    for _ in range(6):
        result = get_engine_move(moves, "beginner")
        assert result.bestmove is not None, f"no legal move after {moves}"
        moves.append(result.bestmove)


def test_illegal_move_is_rejected():
    with pytest.raises(IllegalMoveError) as excinfo:
        get_engine_move(["e2e5"], "beginner")  # pawn can't jump to the 5th rank
    assert excinfo.value.rejected == ["e2e5"]


def test_no_orphaned_processes():
    import subprocess

    def count_uci_processes() -> int:
        out = subprocess.run(["pgrep", "-f", "uci.py"], capture_output=True, text=True)
        return len([line for line in out.stdout.splitlines() if line.strip()])

    before = count_uci_processes()
    get_engine_move([], "beginner")
    after = count_uci_processes()
    assert after == before
