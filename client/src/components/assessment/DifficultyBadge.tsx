import type { Difficulty } from "@/types";

const config: Record<Difficulty, { color: string; label: string }> = {
  easy: { color: "text-green-600", label: "Easy" },
  medium: { color: "text-amber-600", label: "Moderate" },
  hard: { color: "text-red-600", label: "Challenging" },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const c = config[difficulty];
  return (
    <span className={`text-xs font-semibold ${c.color}`}>
      [{c.label}]
    </span>
  );
}
