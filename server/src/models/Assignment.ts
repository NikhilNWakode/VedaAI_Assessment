import mongoose, { Schema, Document } from "mongoose";
import type { AssignmentStatus, QuestionType, Difficulty, GeneratedPaper } from "../types/index.js";

export interface IAssignment extends Document {
  subject: string;
  topic: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: Record<string, number>;
  difficulty: Difficulty | "mixed";
  dueDate: Date;
  additionalInstructions?: string;
  pdfFileName?: string;
  pdfText?: string;
  status: AssignmentStatus;
  generatedPaper?: GeneratedPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Normalizers run at cast time via setters ---
function normalizeQuestionType(raw: string): string {
  if (!raw) return raw;
  const s = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (s.includes("long") || s === "laq") return "long_answer";
  if (s.includes("short") || s === "saq") return "short_answer";
  if (s.includes("true") || s.includes("false") || s === "tf") return "true_false";
  if (s.includes("mcq") || s.includes("multi") || s.includes("choice")) return "mcq";
  return "mcq";
}

function normalizeDifficulty(raw: string): string {
  if (!raw) return raw;
  const s = raw.toLowerCase().trim();
  if (s.includes("easy")) return "easy";
  if (s.includes("hard") || s.includes("difficult")) return "hard";
  return "medium";
}

const QuestionSchema = new Schema(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["mcq", "short_answer", "long_answer", "true_false"],
      required: true,
      set: normalizeQuestionType,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      set: normalizeDifficulty,
    },
    marks: { type: Number, required: true },
    options: [String],
    correctAnswer: String,
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    sectionLabel: { type: String, required: true },
    sectionTitle: { type: String, required: true },
    instructions: { type: String, required: true },
    questions: [QuestionSchema],
    totalMarks: { type: Number, required: true },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema(
  {
    title: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String, required: true },
    generalInstructions: [String],
    sections: [SectionSchema],
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    questionTypes: [
      { type: String, enum: ["mcq", "short_answer", "long_answer", "true_false"] },
    ],
    numberOfQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Schema.Types.Mixed, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      required: true,
    },
    dueDate: { type: Date, required: true },
    additionalInstructions: String,
    pdfFileName: String,
    pdfText: String,
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    generatedPaper: GeneratedPaperSchema,
    error: String,
  },
  { timestamps: true }
);

AssignmentSchema.index({ createdAt: -1 });

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);
