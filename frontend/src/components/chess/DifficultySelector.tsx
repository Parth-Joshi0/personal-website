import type { Difficulty } from "../../lib/chessApi";

const LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  casual: "Casual",
  club: "Club",
  expert: "Expert (full strength)",
};

interface Props {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  disabled: boolean;
}

export default function DifficultySelector({ value, onChange, disabled }: Props) {
  return (
    <label className="chalk-hand flex items-center gap-3 text-lg text-chalk-dim">
      Difficulty
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Difficulty)}
        className="rounded-md border-2 border-dashed border-[#f5f3e7]/30 bg-[#1f2e27] px-3 py-1.5 text-[#f5f3e7] disabled:opacity-50"
      >
        {(Object.keys(LABELS) as Difficulty[]).map((key) => (
          <option key={key} value={key}>
            {LABELS[key]}
          </option>
        ))}
      </select>
    </label>
  );
}
