import catchAsync from "../utils/catchAsync.js";
import { tasks } from "../db/schema.js";
import { db } from "../db/index.js";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { title, description, status, priority, project_id, assigned_to_id} = req.body;

  if (!title || !description || !status || !priority || !project_id || !assigned_to_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide all the required fields",
    });
  }

  const newTask = await db.insert(tasks).values({
    title,
    description,
    status,
    priority,
    project_id,
    assigned_to_id,
  });

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    data: newTask,
  });
});
      
export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { title, description, status, priority, assigned_to_id} = req.body;

  if (!task_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) =>
      eq(tasks.id, Number(task_id)),
  });

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  const updatedTask = await db.update(tasks).set({
    title,
    description,
    status,
    priority,
    assigned_to_id,
  });

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: updatedTask,
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const deletedTask = await db.delete(tasks).where(eq(tasks.id, Number(id)));

  if (!deletedTask) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const task = await db.select().from(tasks).where(eq(tasks.id, Number(id)));

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Task fetched successfully",
    data: task,
  });
});

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const { project_id } = req.params;

  if (!project_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the project ID",
    });
  }

  const allTasks = await db.select().from(tasks).where(eq(tasks.project_id, Number(project_id)));

  if (!allTasks) {
    return res.status(404).json({
      status: "fail",
      message: "Tasks not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Tasks fetched successfully",
    data: allTasks,
  });
});
