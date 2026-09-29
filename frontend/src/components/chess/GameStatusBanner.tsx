export type GameStatus =
  | "playing"
  | "thinking"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "error";

interface Props {
  status: GameStatus;
  winner: "white" | "black" | null;
  errorMessage: string | null;
  onRetry: () => void;
  onNewGame: () => void;
}

export default function GameStatusBanner({ status, winner, errorMessage, onRetry, onNewGame }: Props) {
  if (status === "playing") return null;

  if (status === "thinking") {
    return (
      <p className="chalk-hand text-lg text-chalk-blue" role="status">
        Engine is thinking…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="chalk-panel flex flex-wrap items-center justify-between gap-3 p-4" role="alert">
        <p className="text-chalk-pink">{errorMessage ?? "Something went wrong talking to the engine."}</p>
        <button type="button" onClick={onRetry} className="chalk-scribble-btn rounded-md px-4 py-1.5 text-chalk-yellow">
          Retry
        </button>
      </div>
    );
  }

  const message =
    status === "checkmate"
      ? `Checkmate — ${winner === "white" ? "you win!" : "the engine wins."}`
      : status === "stalemate"
        ? "Stalemate — it's a draw."
        : "Draw.";

  return (
    <div className="chalk-panel flex flex-wrap items-center justify-between gap-3 p-4" role="status">
      <p className="chalk-hand text-xl text-chalk-yellow">{message}</p>
      <button type="button" onClick={onNewGame} className="chalk-scribble-btn rounded-md px-4 py-1.5 text-chalk">
        New game
      </button>
    </div>
  );
}
