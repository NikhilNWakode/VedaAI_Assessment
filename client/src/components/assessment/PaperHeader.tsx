import type { GeneratedPaper } from "@/types";

export function PaperHeader({ paper }: { paper: GeneratedPaper }) {
  // Parse subject and topic from title (e.g. "Mathematics - Probability")
  const [subject, topic] = paper.title.includes(" - ")
    ? paper.title.split(" - ", 2)
    : [paper.title, ""];

  return (
    <div data-pdf-block className="mb-8">
      {/* School name */}
      <div className="mb-1 text-center">
        <h1 className="text-lg font-bold text-gray-900">
          Delhi Public School, Sector-4, Bokaro
        </h1>
      </div>

      {/* Subject & Class */}
      <div className="mb-4 text-center">
        <p className="text-sm font-medium text-gray-800">
          Subject: {subject}
        </p>
        <p className="text-sm font-medium text-gray-800">
          Class: {topic || "—"}
        </p>
      </div>

      {/* Meta line */}
      <div className="mb-6 flex items-center justify-between border-y border-gray-300 py-2.5 text-xs text-gray-600">
        <span>
          <strong>Time:</strong> {paper.duration}
        </span>
        <span>
          <strong>Max. Marks:</strong> {paper.totalMarks}
        </span>
      </div>

      {/* General Instructions */}
      {paper.generalInstructions.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-700">
            General Instructions:
          </h4>
          <ol className="list-inside list-decimal space-y-1 text-xs leading-relaxed text-gray-600">
            {paper.generalInstructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Student info */}
      <div className="mb-6 space-y-3">
        <div className="flex items-end gap-2">
          <span className="w-28 text-xs font-medium text-gray-600">
            Student Name:
          </span>
          <div className="flex-1 border-b border-gray-400" />
        </div>
        <div className="flex items-end gap-2">
          <span className="w-28 text-xs font-medium text-gray-600">
            Roll Number:
          </span>
          <div className="flex-1 border-b border-gray-400" />
        </div>
        <div className="flex items-end gap-2">
          <span className="w-28 text-xs font-medium text-gray-600">
            Class / Section:
          </span>
          <div className="flex-1 border-b border-gray-400" />
        </div>
      </div>

      <hr className="border-gray-300" />
    </div>
  );
}
