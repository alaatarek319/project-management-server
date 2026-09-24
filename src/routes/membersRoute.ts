import express from "express";
import {
    addMember,
    getMembers,
    removeMember
} from "../controllers/membersControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", addMember);
router.get("/:project_id", getMembers);
router.delete("/:project_id/:id", removeMember);

export default router;
