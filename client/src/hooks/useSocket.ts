"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAssessmentStore } from "@/store/assessmentStore";
import type { AssignmentStatus } from "@/types";

export function useSocket(assignmentId: string | null) {
  const { setStatus, setError } = useAssessmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    const socket = getSocket();
    socket.emit("join-assignment", assignmentId);

    const handleStatusUpdate = (data: {
      assignmentId: string;
      status: AssignmentStatus;
      error?: string;
    }) => {
      if (data.assignmentId === assignmentId) {
        setStatus(data.status);
        if (data.error) setError(data.error);
      }
    };

    socket.on("status-update", handleStatusUpdate);

    return () => {
      socket.off("status-update", handleStatusUpdate);
    };
  }, [assignmentId, setStatus, setError]);
}
