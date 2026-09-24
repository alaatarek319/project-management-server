import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import AppError from "../utils/appError.js";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {

    // 1. HANDLE ZOD VALIDATION ERRORS
    if (err instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        const issues = err.issues || [];

        issues.forEach((issue) => {
            const path = issue.path.join(".") || "general";
            formattedErrors[path] = issue.message;
        });

        res.status(400).json({
            status: "fail",
            message: "Validation Error",
            errors: formattedErrors
        });

        return;
    }

    // 2. HANDLE OPERATIONAL ERRORS (AppError)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

        return;
    }

    if (err && typeof err === "object" && err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status || "error",
            message: err.message || "An operational error occurred"
        });

        return;
    }

    // 3. HANDLE UNKNOWN SYSTEM ERRORS
    console.error("🔥 SYSTEM ERROR:", err);

    res.status(500).json({
        status: "error",
        message: "Something went wrong on the server."
    });
};

export default globalErrorHandler;
