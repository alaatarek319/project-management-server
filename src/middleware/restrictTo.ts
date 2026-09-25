import { db } from "../db/index.js";
import { projects, tasks } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

export const owner_only = async(req: Request, res: Response, next: NextFunction) => {
  const { project_id } = req.params;
  const owner_id = req.user.id;

  if (!project_id) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide the project ID",
    });
  }

  const isOwner = await db.query.projects.findFirst({
    where: (projects, { eq }) =>
        and(eq(projects.id, Number(project_id)), eq(projects.owner_id, Number(owner_id))),
    });

  if (!isOwner) {
    return res.status(403).json({
      status: "fail",
      message: "You are not owner, you can't perform this action",
    });
  }

  next();
}
