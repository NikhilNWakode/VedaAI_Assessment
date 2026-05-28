export type QuestionType = "mcq" | "short_answer" | "long_answer" | "true_false";
export type Difficulty = "easy" | "medium" | "hard";
export type AssignmentStatus = "queued" | "processing" | "completed" | "failed";

export interface GeneratedQuestion {
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface PaperSection {
  sectionLabel: string;
  sectionTitle: string;
  instructions: string;
  questions: GeneratedQuestion[];
  totalMarks: number;
}

export interface GeneratedPaper {
  title: string;
  totalMarks: number;
  duration: string;
  generalInstructions: string[];
  sections: PaperSection[];
}

export interface Assignment {
  _id: string;
  subject: string;
  topic: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: Record<string, number>;
  difficulty: Difficulty | "mixed";
  dueDate: string;
  additionalInstructions?: string;
  pdfFileName?: string;
  status: AssignmentStatus;
  generatedPaper?: GeneratedPaper;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  true_false: "True / False",
};
