import type { PaperSection } from "@/types";
import { QuestionItem } from "./QuestionItem";

export function SectionBlock({ section }: { section: PaperSection }) {
  return (
    <div className="mb-8">
      <div data-pdf-block className="mb-4 border-b border-gray-300 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Section {section.sectionLabel}: {section.sectionTitle}
          <span className="ml-2 font-normal normal-case tracking-normal text-gray-500">
            ({section.totalMarks} Marks)
          </span>
        </h3>
        <p className="mt-1 text-xs italic text-gray-500">
          {section.instructions}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {section.questions.map((q) => (
          <QuestionItem key={q.questionNumber} question={q} />
        ))}
      </div>
    </div>
  );
}
