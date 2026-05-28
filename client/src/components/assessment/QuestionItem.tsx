import type { GeneratedQuestion } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";

export function QuestionItem({ question }: { question: GeneratedQuestion }) {
  return (
    <div data-pdf-block className="flex gap-3 py-3">
      <span className="mt-0.5 min-w-[24px] text-sm font-semibold text-gray-700">
        {question.questionNumber}.
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm leading-relaxed text-gray-800">
            {question.questionText}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="whitespace-nowrap text-xs font-medium text-gray-500">
              [{question.marks} {question.marks === 1 ? "Mark" : "Marks"}]
            </span>
          </div>
        </div>
        {question.options && question.options.length > 0 && (
          <div className="mt-2.5 grid grid-cols-2 gap-x-8 gap-y-1.5 pl-0.5">
            {question.options.map((opt, i) => (
              <p key={i} className="text-sm text-gray-600">
                {opt}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
