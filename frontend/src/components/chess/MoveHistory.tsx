interface Props {
  sanMoves: string[];
}

export default function MoveHistory({ sanMoves }: Props) {
  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < sanMoves.length; i += 2) {
    pairs.push([sanMoves[i], sanMoves[i + 1]]);
  }

  return (
    <div className="chalk-panel h-64 overflow-y-auto p-4">
      <h3 className="chalk-hand mb-2 text-lg text-chalk-yellow">Moves</h3>
      {pairs.length === 0 ? (
        <p className="text-sm text-chalk-dim">No moves yet — make the first one.</p>
      ) : (
        <ol className="space-y-1 text-sm text-chalk-dim">
          {pairs.map(([white, black], i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 text-chalk-dim/60">{i + 1}.</span>
              <span className="w-16 text-chalk">{white}</span>
              <span className="text-chalk">{black ?? ""}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
