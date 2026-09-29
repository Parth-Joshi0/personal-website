import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Chess, type Square } from "chess.js";
import Board from "./Board";
import DifficultySelector from "./DifficultySelector";
import MoveHistory from "./MoveHistory";
import GameStatusBanner, { type GameStatus } from "./GameStatusBanner";
import { ChessApiError, getEngineMove, prewarmEngine, type Difficulty } from "../../lib/chessApi";

function messageForError(err: ChessApiError): string {
  switch (err.kind) {
    case "timeout":
      return "The engine took too long to respond. Try again?";
    case "crashed":
      return "The engine crashed mid-search. Try again?";
    case "illegal_move":
      return "The engine and board disagreed on the position — start a new game.";
    default:
      return "Couldn't reach the engine. Check your connection and retry.";
  }
}

export default function ChessGame() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [uciHistory, setUciHistory] = useState<string[]>([]);
  const [lastRequestMoves, setLastRequestMoves] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("club");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [winner, setWinner] = useState<"white" | "black" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  useEffect(() => {
    void prewarmEngine();
  }, []);

  function refreshFromGame() {
    setFen(gameRef.current.fen());
  }

  function checkGameOver(): boolean {
    const game = gameRef.current;
    if (!game.isGameOver()) return false;
    if (game.isCheckmate()) {
      setWinner(game.turn() === "w" ? "black" : "white");
      setStatus("checkmate");
    } else if (game.isStalemate()) {
      setStatus("stalemate");
    } else {
      setStatus("draw");
    }
    return true;
  }

  async function requestEngineMove(movesSoFar: string[]) {
    setStatus("thinking");
    setErrorMessage(null);
    setLastRequestMoves(movesSoFar);
    try {
      const result = await getEngineMove(movesSoFar, difficulty);
      if (!result.bestmove) {
        setStatus("draw");
        return;
      }
      const from = result.bestmove.slice(0, 2);
      const to = result.bestmove.slice(2, 4);
      const promotion = result.bestmove.length > 4 ? result.bestmove[4] : undefined;
      gameRef.current.move({ from, to, promotion });
      refreshFromGame();
      const newHistory = [...movesSoFar, result.bestmove];
      setUciHistory(newHistory);
      if (!checkGameOver()) setStatus("playing");
    } catch (err) {
      setErrorMessage(err instanceof ChessApiError ? messageForError(err) : "Unexpected error talking to the engine.");
      setStatus("error");
    }
  }

  function attemptHumanMove(from: string, to: string): boolean {
    if (status !== "playing") return false;
    const game = gameRef.current;
    const legalMoves = game.moves({ square: from as Square, verbose: true });
    const match = legalMoves.find((m) => m.to === to);
    if (!match) return false;

    try {
      game.move({ from, to, promotion: match.promotion ? "q" : undefined });
    } catch {
      return false;
    }

    const uciMove = from + to + (match.promotion ? "q" : "");
    const newHistory = [...uciHistory, uciMove];
    setUciHistory(newHistory);
    setSelectedSquare(null);
    refreshFromGame();

    if (!checkGameOver()) {
      void requestEngineMove(newHistory);
    }
    return true;
  }

  function onDrop(from: string, to: string): boolean {
    if (status !== "playing") return false;
    return attemptHumanMove(from, to);
  }

  function onSquareClick(square: string) {
    if (status !== "playing") return;
    const game = gameRef.current;

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }
      const moved = attemptHumanMove(selectedSquare, square);
      if (!moved) {
        const piece = game.get(square as Square);
        setSelectedSquare(piece && piece.color === game.turn() ? square : null);
      }
      return;
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    }
  }

  function onNewGame() {
    gameRef.current.reset();
    setUciHistory([]);
    setFen(gameRef.current.fen());
    setStatus("playing");
    setWinner(null);
    setErrorMessage(null);
    setSelectedSquare(null);
  }

  function onRetry() {
    void requestEngineMove(lastRequestMoves);
  }

  const squareStyles = useMemo(() => {
    if (!selectedSquare) return {} as Record<string, CSSProperties>;
    const styles: Record<string, CSSProperties> = {
      [selectedSquare]: { boxShadow: "inset 0 0 0 3px #f4d35e" },
    };
    const legal = gameRef.current.moves({ square: selectedSquare as Square, verbose: true });
    for (const m of legal) {
      styles[m.to] = { boxShadow: "inset 0 0 0 3px rgba(244,211,94,0.5)" };
    }
    return styles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSquare, fen]);

  const boardDisabled = status !== "playing";
  const sanHistory = gameRef.current.history();

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-4 py-8 lg:flex-row">
      <div className="min-w-0 w-full flex-1 basis-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={uciHistory.length > 0} />
          <button type="button" onClick={onNewGame} className="chalk-scribble-btn rounded-md px-4 py-1.5 text-chalk">
            New game
          </button>
        </div>
        <Board
          fen={fen}
          onDrop={onDrop}
          onSquareClick={onSquareClick}
          squareStyles={squareStyles}
          disabled={boardDisabled}
          orientation="white"
        />
        <div className="mt-4 min-h-8">
          <GameStatusBanner
            status={status}
            winner={winner}
            errorMessage={errorMessage}
            onRetry={onRetry}
            onNewGame={onNewGame}
          />
        </div>
      </div>
      <div className="w-full shrink-0 lg:w-64">
        <MoveHistory sanMoves={sanHistory} />
      </div>
    </div>
  );
}
