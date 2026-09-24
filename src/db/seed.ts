import bcrypt from "bcrypt";
import { db } from "./index.js";
import { users, projects, tasks } from "./schema.js";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. DEFAULT USERS
  console.log("👤 Inserting default users...");

  const passwordHash = await bcrypt.hash("password123", 12);

  await db
    .insert(users)
    .values([
      {
        username: "alaa_tarek",
        email: "alaa@example.com",
        password: passwordHash,
      },
      {
        username: "ahmed_ali",
        email: "ahmed@example.com",
        password: passwordHash,
      },
      {
        username: "sara_mohamed",
        email: "sara@example.com",
        password: passwordHash,
      },
    ])
    .onConflictDoNothing();

  // Get users from database
  const allUsers = await db.select().from(users);

  if (allUsers.length === 0) {
    throw new Error("❌ No users found.");
  }

  console.log(`✅ Users ready: ${allUsers.length}`);

  // 2. DEFAULT PROJECTS
  console.log("📁 Inserting default projects...");

  const owner = allUsers[0];

  await db
    .insert(projects)
    .values([
      {
        name: "E-Commerce Website",
        description:
          "Build a complete e-commerce website with authentication, products, and orders.",
        owner_id: owner.id,
      },
      {
        name: "Task Management System",
        description:
          "Develop a platform for managing projects, tasks, and team members.",
        owner_id: owner.id,
      },
    ])
    .onConflictDoNothing();

  // Get projects from database
  const allProjects = await db.select().from(projects);

  if (allProjects.length === 0) {
    throw new Error("❌ No projects found.");
  }

  console.log(`✅ Projects ready: ${allProjects.length}`);

  // 3. DEFAULT TASKS
  console.log("📝 Inserting default tasks...");

  const project = allProjects[0];

  const user1 = allUsers[0];
  const user2 = allUsers.length > 1 ? allUsers[1] : allUsers[0];
  const user3 = allUsers.length > 2 ? allUsers[2] : allUsers[0];

  await db
    .insert(tasks)
    .values([
      {
        title: "Design Homepage",
        description: "Create the homepage UI and responsive layout.",
        status: "Done",
        priority: "High",
        project_id: project.id,
        member_id: user1.id,
      },
      {
        title: "Create Database",
        description: "Design and implement the PostgreSQL database.",
        status: "In progress",
        priority: "High",
        project_id: project.id,
        member_id: user2.id,
      },
      {
        title: "Implement Authentication",
        description:
          "Implement signup, login, logout, and password reset functionality.",
        status: "To Do",
        priority: "Medium",
        project_id: project.id,
        member_id: user3.id,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Tasks ready!");

  console.log("🎉 Database seeded successfully!");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});