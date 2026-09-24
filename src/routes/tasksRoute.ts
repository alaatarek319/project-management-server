import express from "express";
import { createTask, getTasks, updateTask, deleteTask, getTask } from "../controllers/tasksController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
// for all members & owner
router.get("/", getTasks);
router.get("/:id", getTask);

router.patch("/:id", updateTask);
router.post("/", createTask);
router.delete("/:id", deleteTask);

export default router;