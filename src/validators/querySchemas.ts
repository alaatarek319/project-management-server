import { z } from "zod";

// ─── Shared helper ───────────────────────────────────────────────────────────
const positiveIntStr = (field: string) =>
  z
    .string()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        (Number.isInteger(Number(v)) && Number(v) > 0),
      { message: `${field} must be a positive integer` }
    );

// Projects query schema
export const projectsQuerySchema = z.object({
  search: z.string().optional(),

  sortBy: z.enum(["id", "name"]).optional().default("id"),

  order: z.enum(["asc", "desc"]).optional().default("asc"),

  page:  positiveIntStr("page"),
  limit: positiveIntStr("limit"),
});

export type ProjectsQuery = z.infer<typeof projectsQuerySchema>;

// Tasks query schema
export const tasksQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["To Do", "In progress", "Done"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assignee: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || Number.isInteger(Number(v)),
      { message: "assignee must be a numeric user id" }
    ),

  sortBy: z
    .enum(["id", "title", "status", "priority"])
    .optional()
    .default("id"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),

  page:  positiveIntStr("page"),
  limit: positiveIntStr("limit"),
});

export type TasksQuery = z.infer<typeof tasksQuerySchema>;
