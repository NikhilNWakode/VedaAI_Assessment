"use client";

import { create } from "zustand";
import type { QuestionType, Difficulty } from "@/types";

export interface QuestionTypeRow {
  id: string;
  type: QuestionType;
  count: number;
  marks: number;
}

interface FormState {
  /* Step 1 — Basic details */
  subject: string;
  topic: string;
  difficulty: Difficulty | "mixed";
  dueDate: string;

  /* Step 2 — Question config */
  file: File | null;
  questionTypeRows: QuestionTypeRow[];
  additionalInstructions: string;

  /* Navigation */
  step: number;

  /* Actions */
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setStep: (step: number) => void;
  addQuestionTypeRow: () => void;
  removeQuestionTypeRow: (id: string) => void;
  updateQuestionTypeRow: (id: string, updates: Partial<Omit<QuestionTypeRow, "id">>) => void;
  setFile: (file: File | null) => void;
  reset: () => void;

  /* Computed helpers (call as functions) */
  getTotalQuestions: () => number;
  getTotalMarks: () => number;
}

let rowIdCounter = 0;
function nextId() {
  return `row_${++rowIdCounter}_${Date.now()}`;
}

const initialState = {
  subject: "",
  topic: "",
  difficulty: "mixed" as const,
  dueDate: "",
  file: null as File | null,
  questionTypeRows: [] as QuestionTypeRow[],
  additionalInstructions: "",
  step: 1,
};

export const useFormStore = create<FormState>((set, get) => ({
  ...initialState,

  setField: (key, value) => set({ [key]: value } as Partial<FormState>),

  setStep: (step) => set({ step }),

  addQuestionTypeRow: () =>
    set((state) => {
      const usedTypes = state.questionTypeRows.map((r) => r.type);
      const allTypes: QuestionType[] = ["mcq", "short_answer", "long_answer", "true_false"];
      const available = allTypes.find((t) => !usedTypes.includes(t));
      if (!available) return state;
      return {
        questionTypeRows: [
          ...state.questionTypeRows,
          { id: nextId(), type: available, count: 5, marks: 1 },
        ],
      };
    }),

  removeQuestionTypeRow: (id) =>
    set((state) => ({
      questionTypeRows: state.questionTypeRows.filter((r) => r.id !== id),
    })),

  updateQuestionTypeRow: (id, updates) =>
    set((state) => ({
      questionTypeRows: state.questionTypeRows.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  setFile: (file) => set({ file }),

  reset: () => set({ ...initialState, questionTypeRows: [] }),

  getTotalQuestions: () =>
    get().questionTypeRows.reduce((sum, r) => sum + r.count, 0),

  getTotalMarks: () =>
    get().questionTypeRows.reduce((sum, r) => sum + r.count * r.marks, 0),
}));
