// assignment.validator.ts
import { z } from "zod";

const questionTypeEnum = z.enum([
"mcq",
"short_answer",
"long_answer",
"true_false",
]);

export const createAssignmentSchema = z.object({
subject: z
.string()
.trim()
.min(1, "Subject is required")
.max(100),

topic: z
.string()
.trim()
.min(1, "Topic is required")
.max(200),

questionTypes: z
.array(questionTypeEnum)
.min(1, "At least one question type is required"),

numberOfQuestions: z
.number()
.int()
.min(1, "At least 1 question required")
.max(50, "Maximum 50 questions"),

marksPerQuestion: z.record(
questionTypeEnum,
z
.number()
.min(1, "Marks must be at least 1")
.max(20, "Maximum 20 marks allowed")
),

difficulty: z.enum([
"easy",
"medium",
"hard",
"mixed",
]),

dueDate: z
.string()
.refine((date) => !isNaN(Date.parse(date)), {
message: "Invalid due date",
}),

additionalInstructions: z
.string()
.trim()
.max(1000)
.optional(),
});

export type CreateAssignmentInput = z.infer<
typeof createAssignmentSchema

> ;
