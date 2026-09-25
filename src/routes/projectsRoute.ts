import express from "express";
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
} from "../controllers/projectsController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { owner_only } from "../middleware/restrictTo.js";

const router = express.Router();

router.use(verifyToken);
router.route("/")
  .post(createProject)
  .get(getProjects);

router.get("/:project_id", getProject);

router.route("/:project_id")
  .patch(owner_only, updateProject)
  .delete(owner_only, deleteProject);

export default router;