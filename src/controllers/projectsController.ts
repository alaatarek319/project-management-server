import catchAsync from "../utils/catchAsync.js";
import { projects, tasks } from "../db/schema.js";
import { db } from "../db/index.js";
import { Request, Response } from "express";
import { eq, or, exists, and } from "drizzle-orm";

export const createProject = catchAsync(async (req: Request, res: Response) => {
    const { name, description, owner_id} = req.body;

    if (!name || !description || !owner_id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide all the required fields",
        });
    }

    const newProject = await db.insert(projects).values({
        name,
        description,
        owner_id,
    });

    res.status(201).json({
        status: "success",
        message: "Project created successfully",
        data: newProject,
    });
});

export const getProjects = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;

    if (!id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the user ID",
        });
    }

  const allProjects = await db
    .select()
    .from(projects)
    .where(
      or(
        eq(projects.owner_id, Number(id)),
        exists(
          db
            .select()
            .from(tasks)
            .where(
              and(
                eq(tasks.project_id, projects.id),
                eq(tasks.assigned_to_id, Number(id))
              )
            )
          )
        )
      )

    if (!allProjects) {
      return res.status(404).json({
        status: "fail",
        message: "Projects not found",
      });
    }

    res.status(200).json({
        status: "success",
        message: "Projects fetched successfully",
        data: allProjects,
    });
});

export const getProject = catchAsync(async (req: Request, res: Response) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the project ID",
        });
    }

    const project = await db.select().from(projects).where(eq(projects.id, Number(project_id)));

    if (!project) {
        return res.status(404).json({
        status: "fail",
        message: "Project not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "Project fetched successfully",
        data: project,
    });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const { name, description} = req.body;
    const user_id = req.user.id;

    if (!project_id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the project ID",
        });
    }

    const project = await db.query.projects.findFirst({
        where: (projects, { eq }) =>
            eq(projects.id, Number(project_id)),
        });

    if (!project) {
    return res.status(404).json({
        status: "fail",
        message: "Project not found",
    });
    }

    if (project.owner_id !== Number(user_id)) {
    return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this project",
    });
    }

    const updatedProject = await db
    .update(projects)
    .set({
        name,
        description,
    })
    .where(eq(projects.id, Number(project_id)))
    .returning();

    res.status(200).json({
        status: "success",
        message: "Project updated successfully",
        data: updatedProject,
    });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const user_id = req.user.id;

    if (!project_id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the project ID",
        });
    }

    const project = await db.query.projects.findFirst({
        where: (projects, { eq }) =>
            eq(projects.id, Number(project_id)),
        });

    if (!project) {
    return res.status(404).json({
        status: "fail",
        message: "Project not found",
    });
    }

    if (project.owner_id !== Number(user_id)) {
    return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this project",
    });
    }

    const deletedProject = await db.delete(projects).where(eq(projects.id, Number(project_id)));

    if (!deletedProject) {
        return res.status(404).json({
        status: "fail",
        message: "Project not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "Project deleted successfully",
    });
});
