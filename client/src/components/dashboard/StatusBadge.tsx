import type { AssignmentStatus } from "@/types";

const config: Record<AssignmentStatus, { bg: string; text: string; dot: string; label: string }> = {
  queued: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: "Queued" },
  processing: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400", label: "Processing" },
  completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400", label: "Completed" },
  failed: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400", label: "Failed" },
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
