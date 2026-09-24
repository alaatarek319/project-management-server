import express from "express";
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
} from "../controllers/projectsController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.post("/", createProject);
router.get("/", getProjects);

router.get("/:id", getProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;