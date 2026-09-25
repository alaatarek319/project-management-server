import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// Load environment variables before importing routes/middlewares
dotenv.config();
import userRouter from "./routes/usersRoute.js";
import requestLogger from "./middleware/requestLogger.js";
import globalErrorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/appError.js";
import projectRouter from "./routes/projectsRoute.js";
import tasksRouter from "./routes/tasksRoute.js";
import membersRouter from "./routes/membersRoute.js";

const app = express();

// 1. Global Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use(requestLogger);
}

// 2. Health check route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Project Management API is running",
    });
});
// 3. API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/members", membersRouter);

// 4. Handle undefined routes
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 5. Global Error Handler
app.use(globalErrorHandler);
export default app;
