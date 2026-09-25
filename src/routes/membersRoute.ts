import express from "express";
import {
    addMember,
    getMembers,
    removeMember
} from "../controllers/membersControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { owner_only } from "../middleware/restrictTo.js";

const router = express.Router();

router.use(verifyToken);

router.get("/:project_id", getMembers);
router.post("/:project_id", owner_only, addMember);
router.delete("/:project_id/:member_id", owner_only, removeMember);

export default router;
