"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAssignment } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  assignmentId: string;
  redirectTo?: string;
  onDeleted?: () => void;
}

export function DeleteButton({ assignmentId, redirectTo = "/", onDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment? This action cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteAssignment(assignmentId);
      toast.success("Assessment deleted");
      if (onDeleted) {
        onDeleted();
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4 text-red-400" />
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}