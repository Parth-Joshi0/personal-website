import { Chessboard } from "react-chessboard";
import type { CSSProperties } from "react";

interface Props {
  fen: string;
  onDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: string) => void;
  squareStyles: Record<string, CSSProperties>;
  disabled: boolean;
  orientation: "white" | "black";
}

export default function Board({ fen, onDrop, onSquareClick, squareStyles, disabled, orientation }: Props) {
  return (
    <div className="chessboard-shell">
      <Chessboard
        options={{
          id: "parth-chess",
          position: fen,
          boardOrientation: orientation,
          allowDragging: !disabled,
          squareStyles,
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (disabled || !targetSquare) return false;
            return onDrop(sourceSquare, targetSquare);
          },
          onSquareClick: ({ square }) => {
            if (disabled) return;
            onSquareClick(square);
          },
          squareStyle: {
            aspectRatio: "1 / 1",
            minWidth: 0,
            minHeight: 0,
            boxSizing: "border-box",
          },
          darkSquareStyle: { backgroundColor: "#2a3b31" },
          lightSquareStyle: { backgroundColor: "#3f5648" },
          dropSquareStyle: { boxShadow: "inset 0 0 0 4px #f4d35e" },
          draggingPieceStyle: { transform: "scale(1.05)" },
          boardStyle: {
            width: "100%",
            height: "auto",
            aspectRatio: "1 / 1",
            gap: 0,
            borderRadius: "0.75rem",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          },
        }}
      />
    </div>
  );
}
