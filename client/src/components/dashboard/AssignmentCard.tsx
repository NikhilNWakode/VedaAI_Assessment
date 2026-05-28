"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Eye, Calendar } from "lucide-react";
import type { Assignment } from "@/types";
import { DeleteButton } from "../common/DeleteButton";

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md">
      {/* 3-dot menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
            <Link
              href={`/assessment/${assignment._id}`}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              <Eye className="h-4 w-4 text-gray-400" />
              View Assignment
            </Link>
            <DeleteButton assignmentId={assignment._id} redirectTo="/" />
          </div>
        )}
      </div>

      {/* Card content */}
      <Link href={`/assessment/${assignment._id}`} className="block">
        <h3 className="mb-1 pr-8 text-base font-bold text-gray-900">
          {assignment.subject} — {assignment.topic}
        </h3>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              Assigned on{" "}
              {format(new Date(assignment.createdAt), "dd MMM, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              Due {format(new Date(assignment.dueDate), "dd MMM, yyyy")}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              assignment.status === "completed"
                ? "bg-green-50 text-green-700"
                : assignment.status === "processing"
                  ? "bg-blue-50 text-blue-700"
                  : assignment.status === "failed"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                assignment.status === "completed"
                  ? "bg-green-500"
                  : assignment.status === "processing"
                    ? "bg-blue-500"
                    : assignment.status === "failed"
                      ? "bg-red-500"
                      : "bg-gray-400"
              }`}
            />
            {assignment.status === "completed"
              ? "Completed"
              : assignment.status === "processing"
                ? "Processing"
                : assignment.status === "failed"
                  ? "Failed"
                  : "Queued"}
          </span>
        </div>
      </Link>
    </div>
  );
}
