import type { GeneratedPaper, QuestionType } from "@/types";

export function AnswerKey({ paper }: { paper: GeneratedPaper }) {
  const answerable = paper.sections.flatMap((s) =>
    s.questions
      .filter((q) => q.correctAnswer)
      .map((q) => ({
        number: q.questionNumber,
        answer: q.correctAnswer!,
        type: q.questionType,
        section: s.sectionLabel,
      }))
  );

  if (answerable.length === 0) return null;

  // Separate short/inline answers (MCQ, true_false) from long answers (short_answer, long_answer)
  const inline = answerable.filter(
    (a) => a.type === "mcq" || a.type === "true_false"
  );
  const detailed = answerable.filter(
    (a) => a.type === "short_answer" || a.type === "long_answer"
  );

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-6">
      <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-gray-900">
        Answer Key
      </h3>

      {/* Inline answers (MCQ / True-False) */}
      {inline.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
          {inline.map((a) => (
            <div
              key={`${a.section}-${a.number}`}
              className="flex items-center gap-2 text-xs text-gray-700"
            >
              <span className="font-semibold">Q{a.number}.</span>
              <span className="text-gray-600">{a.answer}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed answers (Short Answer / Long Answer) */}
      {detailed.length > 0 && (
        <div className="space-y-4">
          {detailed.map((a) => (
            <div
              key={`${a.section}-${a.number}`}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <p className="mb-1 text-xs font-semibold text-gray-800">
                Q{a.number}.{" "}
                <span className="font-normal text-gray-400">
                  ({a.type === "short_answer" ? "Short Answer" : "Long Answer"})
                </span>
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                {a.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
