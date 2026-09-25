import catchAsync from "../utils/catchAsync.js";
import { db } from "../db/index.js";
import { members, projects } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Request, Response } from "express";

export const addMember = catchAsync(async (req: Request, res: Response) => {
    const { member_id } = req.body;
    const { project_id } = req.params;
    
    if (!member_id) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide all the required fields",
        });
    }

    // check if the member is already a member of the project
    const existingMember = await db.select().from(members).where(and(eq(members.project_id, Number(project_id)), eq(members.member_id, Number(member_id))));
    if (existingMember.length !== 0) {
        return res.status(400).json({
            status: "fail",
            message: "Member is already a member of this project",
        });
    }

    const newMember = await db.insert(members).values({
        project_id: Number(project_id),
        member_id: Number(member_id),
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

    if (!member_id) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide all the required fields",
        });
    }

    // check if the member is already a member of the project
    const existingMember = await db.select().from(members).where(and(eq(members.project_id, Number(project_id)), eq(members.member_id, Number(member_id))));
    if (!existingMember) {
        return res.status(404).json({
            status: "fail",
            message: "Member is not a member of this project",
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