"use client";

import { create } from "zustand";
import type { AssignmentStatus, GeneratedPaper } from "@/types";

interface AssessmentState {
  currentId: string | null;
  status: AssignmentStatus | null;
  paper: GeneratedPaper | null;
  error: string | null;
  isLoading: boolean;

  setCurrentId: (id: string) => void;
  setStatus: (status: AssignmentStatus) => void;
  setPaper: (paper: GeneratedPaper) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentId: null,
  status: null,
  paper: null,
  error: null,
  isLoading: false,
  setCurrentId: (id) => set({ currentId: id }),
  setStatus: (status) => set({ status }),
  setPaper: (paper) => set({ paper }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () =>
    set({
      currentId: null,
      status: null,
      paper: null,
      error: null,
      isLoading: false,
    }),
}));
