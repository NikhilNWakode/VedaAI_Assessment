// assignment.service.ts
import Assignment from "../models/Assignment.js";
import { generationQueue } from "../config/redis.js";
import type { CreateAssignmentInput } from "../validators/assignment.validator.js";

export async function createAssignment(
data: CreateAssignmentInput,
pdfText?: string,
pdfFileName?: string
) {
const assignment = await Assignment.create({
...data,
pdfText,
pdfFileName,
status: "queued",
});

try {
await generationQueue.add("generate", {
assignmentId: assignment._id.toString(),
});
} catch (error) {
assignment.status = "failed";
assignment.error = "Failed to enqueue generation job";


await assignment.save();

throw error;


}

return assignment;
}

export async function getAssignment(id: string) {
const assignment = await Assignment.findById(id);

if (!assignment) {
throw new Error("Assignment not found");
}

return assignment;
}

export async function listAssignments() {
return Assignment.find()
.select("-generatedPaper -pdfText")
.sort({ createdAt: -1 })
.lean();
}

export async function deleteAssignment(id: string) {
  const assignment = await Assignment.findByIdAndDelete(id);
  if (!assignment) throw new Error("Assignment not found");
  return assignment;
}