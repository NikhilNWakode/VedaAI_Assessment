"use client";

import { useEffect, useState } from "react";
import { listAssignments } from "@/lib/api";
import { AssignmentList } from "@/components/dashboard/AssignmentList";
import { Spinner } from "@/components/ui/Spinner";
import type { Assignment } from "@/types";

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAssignments()
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-orange-500" />
        </div>
      ) : (
        <AssignmentList assignments={assignments} />
      )}
    </div>
  );
}
