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

export interface AssignmentInput {
  subject: string;
  topic: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: Record<string, number>;
  difficulty: Difficulty | "mixed";
  dueDate: string;
  additionalInstructions?: string;
  pdfText?: string;
}
