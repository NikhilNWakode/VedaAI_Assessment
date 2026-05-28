// assignment.controller.ts
import { Request, Response, NextFunction } from "express";
import { createAssignmentSchema } from "../validators/assignment.validator.js";
import * as assignmentService from "../services/assignment.service.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";

export async function createAssignment(
req: Request,
res: Response,
next: NextFunction
): Promise<void> {
try {
let rawData;


try {
  rawData = req.body.data
    ? JSON.parse(req.body.data)
    : req.body;
} catch {
  res.status(400).json({
    error: "Invalid JSON format",
  });
  return;
}

const validated = createAssignmentSchema.parse(rawData);

let pdfText: string | undefined;
let pdfFileName: string | undefined;

if (req.file) {
  pdfText = await extractTextFromPDF(req.file.buffer);
  pdfFileName = req.file.originalname;
}

const assignment = await assignmentService.createAssignment(
  validated,
  pdfText,
  pdfFileName
);

res.status(201).json({
  message: "Assignment created successfully",
  assignmentId: assignment._id,
  status: assignment.status,
});


} catch (err) {
next(err);
}
}

export async function getAssignment(
req: Request,
res: Response,
next: NextFunction
): Promise<void> {
try {
const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const assignment = await assignmentService.getAssignment(id);


res.json(assignment);


} catch (err) {
if (err instanceof Error && err.message === "Assignment not found") {
res.status(404).json({
error: "Assignment not found",
});
return;
}


next(err);


}
}

export async function listAssignments(
_req: Request,
res: Response,
next: NextFunction
): Promise<void> {
try {
const assignments = await assignmentService.listAssignments();

res.json(assignments);


} catch (err) {
next(err);
}
}

export async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await assignmentService.deleteAssignment(id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    if (err instanceof Error && err.message === "Assignment not found") {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    next(err);
  }
}