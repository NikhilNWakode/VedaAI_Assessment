// generation.worker.ts
import { Worker, Job } from "bullmq";
import { createConnection } from "../config/redis.js";
import { getIO } from "../config/socket.js";
import Assignment from "../models/Assignment.js";
import { generatePaper } from "../services/gemini.service.js";
import type { AssignmentInput } from "../types/index.js";

const worker = new Worker(
"assessment-generation",
async (job: Job) => {
const { assignmentId } = job.data;


const io = getIO();

try {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Processing status
  assignment.status = "processing";
  await assignment.save();

  io.to(`assignment:${assignmentId}`).emit("status-update", {
    assignmentId,
    status: "processing",
  });

  console.log(`Generating paper for assignment ${assignmentId}`);

  const input: AssignmentInput = {
    subject: assignment.subject,
    topic: assignment.topic,
    questionTypes: assignment.questionTypes,
    numberOfQuestions: assignment.numberOfQuestions,
    marksPerQuestion:
      assignment.marksPerQuestion as AssignmentInput["marksPerQuestion"],
    difficulty: assignment.difficulty,
    dueDate: assignment.dueDate.toISOString(),
    additionalInstructions: assignment.additionalInstructions,
    pdfText: assignment.pdfText,
  };

  const generatedPaper = await generatePaper(input);

  assignment.status = "completed";
  assignment.generatedPaper = generatedPaper;

  await assignment.save();

  io.to(`assignment:${assignmentId}`).emit("status-update", {
    assignmentId,
    status: "completed",
  });

  console.log(`Assignment ${assignmentId} completed`);
} catch (error) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";

  console.error(
    `Assignment generation failed for ${assignmentId}:`,
    errorMessage
  );

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "failed",
    error: errorMessage,
  });

  io.to(`assignment:${assignmentId}`).emit("status-update", {
    assignmentId,
    status: "failed",
    error: errorMessage,
  });

  throw error;
}


},
{
connection: createConnection("worker") as any,
concurrency: 1,
}
);

worker.on("ready", () => {
  console.log("Worker READY — listening for jobs");
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

console.log("Worker registered for queue: assessment-generation");

export default worker;
