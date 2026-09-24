import {
  pgTable,
  pgEnum,
  varchar,
  serial,
  integer,
  text,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// 1. POSTGRESQL ENUMS
export const statusTypeEnum = pgEnum("status_type_enum", [
  "To Do",
  "In progress",
  "Done",
]);

export const priorityTypeEnum = pgEnum("priority_type_enum", [
  "Low",
  "Medium",
  "High",
]);

// 2. TABLES
// USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  username: varchar("username", { length: 50 })
    .notNull()
    .unique(),

  email: varchar("email", { length: 50 })
    .notNull()
    .unique(),

  // Store bcrypt hash, NEVER plain password
  password: varchar("password", { length: 100 })
    .notNull(),

  passwordResetToken: varchar("password_reset_token", {
    length: 100,
  }),

  passwordResetExpires: timestamp("password_reset_expires", {
    withTimezone: true,
  }),
});

// PROJECTS
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 100 })
      .notNull(),

    description: text("description")
      .notNull(),

    owner_id: integer("owner_id")
      .notNull()
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },

  (table) => [
    index("idx_projects_owner").on(table.owner_id),
  ]
);

// MEMBERS
export const members = pgTable(
  "members",
  {
    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    member_id: integer("member_id")
      .notNull()
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },

  (table) => [
    primaryKey({
      columns: [
        table.project_id,
        table.member_id,
      ],
    }),
  ]
);

// TASKS
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),

    title: varchar("title", {
      length: 200,
    }).notNull(),

    description: text("description"),

    status: statusTypeEnum("status")
      .notNull()
      .default("To Do"),

    priority: priorityTypeEnum("priority")
      .notNull(),

    project_id: integer("project_id")
      .notNull()
      .references(() => projects.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    assigned_to_id: integer("assigned_to_id")
      .notNull()
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },

  (table) => [
    index("idx_tasks_project")
      .on(table.project_id),

    index("idx_tasks_assigned_to")
      .on(table.assigned_to_id),

    index("idx_tasks_status")
      .on(table.status),
  ]
);

// REFRESH TOKENS
export const refreshToken = pgTable(
  "refresh_token",
  {
    id: serial("id").primaryKey(),

    token: varchar("token", {
      length: 500,
    })
      .notNull()
      .unique(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),

    expires_at: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),
  },

  (table) => [
    index("idx_refresh_token_user")
      .on(table.userId),
  ]
);

// 3. RELATIONS

// USERS RELATIONS
export const usersRelations = relations(
  users,
  ({ many }) => ({
    ownedProjects: many(projects),

    memberships: many(members),

    assignedTasks: many(tasks),

    refreshTokens: many(refreshToken),
  })
);

// PROJECTS RELATIONS
export const projectsRelations = relations(
  projects,
  ({ one, many }) => ({
    // Project owner
    owner: one(users, {
      fields: [projects.owner_id],
      references: [users.id],
    }),

    // Project members
    members: many(members),

    // Project tasks
    tasks: many(tasks),
  })
);

// MEMBERS RELATIONS
export const membersRelations = relations(
  members,
  ({ one }) => ({
    project: one(projects, {
      fields: [members.project_id],
      references: [projects.id],
    }),

    user: one(users, {
      fields: [members.member_id],
      references: [users.id],
    }),
  })
);

// TASKS RELATIONS
export const tasksRelations = relations(
  tasks,
  ({ one }) => ({
    project: one(projects, {
      fields: [tasks.project_id],
      references: [projects.id],
    }),

    assignedUser: one(users, {
      fields: [tasks.assigned_to_id],
      references: [users.id],
    }),
  })
);

// REFRESH TOKEN RELATIONS
export const refreshTokenRelations = relations(
  refreshToken,
  ({ one }) => ({
    user: one(users, {
      fields: [refreshToken.userId],
      references: [users.id],
    }),
  })
);