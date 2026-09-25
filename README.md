# Project Management System - Backend

A RESTful backend API for a Project Management System. The system provides authentication, project management, task management, team members management, role-based access control, and secure API endpoints.

## Project Overview

This project is a backend API for managing projects and their tasks.

Authenticated users can:

* Register and log in securely.
* Manage their profile and password.
* Create, view, update, and delete projects.
* Create and manage tasks within projects.
* Assign tasks to users.
* Update task status based on task assignment.
* Manage project members.
* Use protected endpoints through JWT authentication.
* Reset forgotten passwords through email.
* Refresh expired access tokens.

The API follows a RESTful architecture and uses PostgreSQL as the database.

---

## Technologies Used

### Backend

* Node.js
* Express.js
* TypeScript
* Drizzle ORM
* PostgreSQL
* Zod
* JWT (JSON Web Tokens)
* bcrypt
* Nodemailer
* CORS
* Cookie Parser
* Express Rate Limit
* Morgan
* Vitest
* Supertest

### Database

* PostgreSQL
* Supabase PostgreSQL
* Drizzle ORM
* Drizzle Kit

### Development Tools

* Postman
* Git / GitHub
* Vercel

---

## Project Structure

```text
server/
│
├── src/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── app.ts
│
│
├── index.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <https://github.com/alaatarek319/project-management-server>
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=4000
NODE_ENV=development

CLIENT_URL=http://localhost:5173

DATABASE_URL=your_postgresql_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email
```

Do not commit the `.env` file to GitHub.

---

## How to Run the Project

### Development

```bash
npm run dev
```

The server will run on:

```text
http://localhost:4000
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

---

# Database Setup

The project uses PostgreSQL with Drizzle ORM.

Make sure the `DATABASE_URL` environment variable points to your PostgreSQL database.

### Push the schema to the database

```bash
npm run db:push
```

### Open Drizzle Studio

```bash
npm run db:studio
```

### Seed the database

```bash
npm run db:seed
```

### Clear the database

```bash
npm run db:clear
```

---

# Authentication

The API uses JWT-based authentication.

After login, an access token and refresh token are generated.

The access token is used to access protected endpoints.

Authentication can be provided through:

* HTTP-only cookies
* Bearer token in the `Authorization` header

Example:

```http
Authorization: Bearer <access_token>
```

Protected routes use the `verifyToken` middleware.

---

# API Documentation

The API is documented using a structured Postman Collection.

The collection is organized into folders for the main resources:

```text
Project Management API
│
├── Auth
├── Projects
├── Tasks
└── Members
```

## Base URL

```text
http://localhost:4000/api/v1
```

For the deployed API, replace the base URL with the Vercel deployment URL.

---

## Authentication Endpoints

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/users/register`              | Register a new user    |
| POST   | `/users/login`                 | Login                  |
| POST   | `/users/logout`                | Logout                 |
| POST   | `/users/refresh-token`         | Refresh access token   |
| POST   | `/users/forgot-password`       | Request password reset |
| PATCH  | `/users/reset-password/:token` | Reset password         |
| GET    | `/users/me`                    | Get current user       |
| PATCH  | `/users/update-me`             | Update current user    |
| PATCH  | `/users/update-password`       | Update password        |
| DELETE | `/users/delete-me`             | Delete current user    |
| GET    | `/users/:id`                   | Get a user             |

---

## Project Endpoints

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/projects`             | Create a project       |
| GET    | `/projects`             | Get projects           |
| GET    | `/projects/:project_id` | Get a specific project |
| PATCH  | `/projects/:project_id` | Update a project       |
| DELETE | `/projects/:project_id` | Delete a project       |

Project update and delete operations are protected by an owner-only middleware.

---

## Task Endpoints

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | `/tasks/project/:project_id` | Create a task       |
| GET    | `/tasks/project/:project_id` | Get project tasks   |
| GET    | `/tasks/:task_id`            | Get a specific task |
| PATCH  | `/tasks/:task_id`            | Update a task       |
| PATCH  | `/tasks/status/:task_id`     | Update task status  |
| DELETE | `/tasks/:task_id`            | Delete a task       |

Task status updates are restricted to the user assigned to the task.

---

## Member Endpoints

The Members API provides endpoints for managing users and their membership within projects.

| Method | Endpoint                                 | Description                    | Authorization      |
| ------ | ---------------------------------------- | ------------------------------ | ------------------ |
| GET    | `/members/:project_id`                   | Get all members of a project   | Authenticated user |
| POST   | `/members/:project_id`                   | Add a member to a project      | Project owner      |
| DELETE | `/members/:project_id/:member_id`        | Remove a member from a project | Project owner      |

See the Postman Collection for request bodies, authentication requirements, and example responses.

# Database Design

The system uses PostgreSQL with Drizzle ORM.

The main entities include:

### Users

Stores user account and authentication information.

Main information includes:

* User ID
* Username
* Email
* Password
* User-related authentication data

### Projects

Stores project information.

Main fields include:

* Project ID
* Name
* Description
* Owner ID

Each project belongs to an owner.

### Tasks

Stores tasks associated with projects.

Tasks include information such as:

* Task ID
* Project
* Title
* Description
* Priority
* Status
* Assigned user

### Members

* Project ID
* User ID

### Refresh Tokens

Stores refresh tokens associated with users to support secure access-token renewal.

---

# Authorization and Access Control

The API uses middleware-based authorization.

### Authentication

Protected routes require a valid JWT access token.

### Project Owner Authorization

Only the project owner can perform owner-specific operations such as:

* Updating a project
* Deleting a project
* Performing owner-restricted project operations

### Task Authorization

Only the user assigned to a task can update its status.
Only the owner can edit or delete tasks.

---

# Input Validation

Request data is validated using **Zod** schemas.

Invalid input returns a structured validation error instead of being processed by the controller.

Example:

```json
{
  "status": "fail",
  "message": "Validation Error",
  "errors": {}
}
```

Database queries are performed through Drizzle ORM using parameterized queries.

---

# Rate Limiting

Sensitive endpoints are protected against excessive requests.

The login endpoint uses rate limiting:

```text
Maximum: 5 requests
Window: 15 minutes
```

If the limit is exceeded, the API returns:

```text
429 Too Many Requests
```

This helps reduce brute-force login attempts.

---

# Logging

HTTP requests are logged using Morgan.

Example:

```text
POST /api/v1/users/login 200 35 ms
POST /api/v1/projects 201 42 ms
DELETE /api/v1/tasks/1 204 18 ms
```

Application errors are handled through the global error-handling middleware.

---

# Error Handling

The API uses a centralized global error handler.

It handles errors such as:

* Validation errors
* Authentication errors
* Authorization errors
* Invalid JWTs
* Expired JWTs
* Duplicate database values
* Invalid database input
* Unknown server errors

Responses follow a consistent structure:

```json
{
  "status": "fail",
  "message": "Error message"
}
```

---

# API Testing

The API can be tested using Postman.

The Postman Collection contains organized folders for:

* Authentication
* Projects
* Tasks
* Members

Requests include the required HTTP methods, URLs, request bodies, parameters, authentication, and example responses.

---

# Deployment

The backend is deployed on Vercel.

The application uses environment variables configured in the deployment environment for:

* Database connection
* JWT secrets
* Client URL
* Email configuration

---

# Assumptions and Additional Features

The following features were implemented as additional backend functionality:

* JWT authentication
* HTTP-only cookies for authentication tokens
* Refresh token mechanism
* Password reset functionality
* Role/authentication middleware
* Project-owner authorization
* Task-assignee authorization
* Zod input validation
* Centralized error handling
* Login rate limiting
* HTTP request logging
* PostgreSQL database with Drizzle ORM
* Postman API documentation
* Vercel deployment

The API assumes that users must be authenticated before accessing protected project, task, and member operations.

---

# Available Scripts

```bash
npm run dev
npm run build
npm start

npm run db:push
npm run db:studio
npm run db:seed
npm run db:clear

npm test
```

---