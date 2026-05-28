import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  createAssignment,
  getAssignment,
  listAssignments,
  deleteAssignment,
} from "../controllers/assignment.controller.js";

const router = Router();

router.post("/", upload.single("file"), createAssignment);
router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.delete("/:id", deleteAssignment);

export default router;
