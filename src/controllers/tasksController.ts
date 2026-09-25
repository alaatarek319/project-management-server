import catchAsync from "../utils/catchAsync.js";
import { tasks, projects } from "../db/schema.js";
import { db } from "../db/index.js";
import { Request, Response } from "express";
import { eq, and, ilike, asc, desc, sql } from "drizzle-orm";
import { tasksQuerySchema } from "../validators/querySchemas.js";

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { title, description, priority, assigned_to_id } = req.body;
  const { project_id } = req.params;
  const owner_id = req.user.id;

  if (!title || !description || !priority || !assigned_to_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide all the required fields",
    });
  }

  if (owner_id === assigned_to_id) {
    return res.status(403).json({
      status: "fail",
      message: "You can't create tasks for yourself",
    });
  }

  const newTask = await db.insert(tasks).values({
    title,
    description,
    priority,
    project_id: Number(project_id),
    assigned_to_id,
  });

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    data: newTask,
  });
});

export const editTask = catchAsync(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { title, description, priority, assigned_to_id } = req.body;
  const owner_id = req.user.id;

  if (!task_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  if (!title || !description || !priority || !assigned_to_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide all the required fields",
    });
  }

  if (owner_id === assigned_to_id) {
    return res.status(403).json({
      status: "fail",
      message: "You can't edit tasks for yourself",
    });
  }

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, Number(task_id)),
  });

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  const updatedTask = await db
    .update(tasks)
    .set({ title, description, priority, assigned_to_id })
    .where(eq(tasks.id, Number(task_id)));

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: updatedTask,
  });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  console.log("DONE")
  const task_id = Number(req.params.task_id);
  const { status } = req.body;
  const assigned_to_id = req.user.id;

  if (!task_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const task = await db.query.tasks.findFirst({
    where: (tasks, { eq }) => eq(tasks.id, Number(task_id)),
  });

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  if (task.assigned_to_id !== assigned_to_id) {
    return res.status(403).json({
      status: "fail",
      message: "You are not assigned to this task",
    });
  }

  const updatedTask = await db
    .update(tasks)
    .set({ status })
    .where(eq(tasks.id, task_id))
    .returning();

  res.status(200).json({
    status: "success",
    message: "Task status updated successfully",
    data: updatedTask[0],
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const task_id = Number(req.params.task_id);

  if (!task_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const deletedTask = await db
    .delete(tasks)
    .where(eq(tasks.id, Number(task_id)));

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
  const { task_id } = req.params;

  if (!task_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the task ID",
    });
  }

  const task = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, Number(task_id)));

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Task fetched successfully",
    data: task[0],
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

  // Validate & parse query params
  const parsed = tasksQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid query parameters",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { search, status, priority, assignee, sortBy, order, page, limit } =
    parsed.data;

  const pageNum  = page  ? Number(page)  : 1;
  const limitNum = limit ? Number(limit) : 10;
  const offset   = (pageNum - 1) * limitNum;

  // Build WHERE clause — always scoped to the project
  const conditions: ReturnType<typeof eq>[] = [
    eq(tasks.project_id, Number(project_id)),
  ];

  if (status)   conditions.push(eq(tasks.status,          status));
  if (priority) conditions.push(eq(tasks.priority,        priority));
  if (assignee) conditions.push(eq(tasks.assigned_to_id,  Number(assignee)));
  if (search)   conditions.push(ilike(tasks.title,        `%${search}%`) as any);

  const whereClause = and(...conditions);

  // Semantic sort expressions
  const prioritySortExpr = sql`CASE ${tasks.priority}
    WHEN 'High'   THEN 1
    WHEN 'Medium' THEN 2
    WHEN 'Low'    THEN 3
    ELSE 4
  END`;

  const statusSortExpr = sql`CASE ${tasks.status}
    WHEN 'To Do'       THEN 1
    WHEN 'In progress' THEN 2
    WHEN 'Done'        THEN 3
    ELSE 4
  END`;

  let orderExpr: any;
  if (sortBy === "title") {
    orderExpr = order === "desc" ? desc(tasks.title)    : asc(tasks.title);
  } else if (sortBy === "priority") {
    orderExpr = order === "desc" ? desc(prioritySortExpr) : asc(prioritySortExpr);
  } else if (sortBy === "status") {
    orderExpr = order === "desc" ? desc(statusSortExpr)   : asc(statusSortExpr);
  } else {
    orderExpr = order === "desc" ? desc(tasks.id)       : asc(tasks.id);
  }

  // Count total for pagination metadata
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(tasks)
    .where(whereClause);

  // Fetch the requested page
  const allTasks = await db
    .select()
    .from(tasks)
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(limitNum)
    .offset(offset);

  res.status(200).json({
    status: "success",
    message: "Tasks fetched successfully",
    pagination: {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data: allTasks,
  });
});
