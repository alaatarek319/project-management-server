import catchAsync from "../utils/catchAsync.js";
import { db } from "../db/index.js";
import { members } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Request, Response } from "express";

export const addMember = catchAsync(async (req: Request, res: Response) => {
    const { project_id, member_id } = req.body;

    if (!project_id || !member_id) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide all the required fields",
        });
    }

    const newMember = await db.insert(members).values({
        project_id,
        member_id,
    });

    res.status(201).json({
        status: "success",
        message: "Member added successfully",
        data: newMember,
    });
});

export const getMembers = catchAsync(async (req: Request, res: Response) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide the project ID",
        });
    }

    const allMembers = await db.select().from(members).where(eq(members.project_id, Number(project_id)));

    if (!allMembers) {
        return res.status(404).json({
            status: "fail",
            message: "Members not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "Members fetched successfully",
        data: allMembers,
    });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
    const { project_id, member_id } = req.params;

    if (!project_id || !member_id) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide all the required fields",
        });
    }

    const deletedMember = await db.delete(members).where(and(eq(members.project_id, Number(project_id)), eq(members.member_id, Number(member_id))));

    if (!deletedMember) {
        return res.status(404).json({
            status: "fail",
            message: "Member not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "Member deleted successfully",
    });
});