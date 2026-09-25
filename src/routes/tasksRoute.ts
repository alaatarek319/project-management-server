import express from "express";
import { createTask, getTasks, editTask, updateStatus, deleteTask, getTask } from "../controllers/tasksController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { owner_only } from "../middleware/restrictTo.js";

const router = express.Router();

router.use(verifyToken);
// for all members & owner
router.route('/project/:project_id')
      .get(getTasks)
      .post(owner_only, createTask)

router.get('/:task_id', getTask)

router.patch("/status/:task_id", updateStatus);

router.route('/:project_id/:task_id')
      .patch(owner_only, editTask)
      .delete(owner_only, deleteTask);

export default router;