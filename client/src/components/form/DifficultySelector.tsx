"use client";

import { useFormStore } from "@/store/formStore";
import type { Difficulty } from "@/types";

const options: { value: Difficulty | "mixed"; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

export function DifficultySelector() {
  const { difficulty, setField } = useFormStore();

  return (
    <div>
      <label className="mb-2.5 block text-sm font-semibold text-gray-800">
        Difficulty Level
      </label>
      <div className="flex gap-2.5">
        {options.map((opt) => {
          const selected = difficulty === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("difficulty", opt.value)}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
