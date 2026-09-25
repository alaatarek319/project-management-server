import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import  jwt from "jsonwebtoken";

import AppError from "../utils/appError.js";

// ERROR HANDLERS
const handleJWTError = () =>
  new AppError("Invalid token. Please login again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again!", 401);

const handleDuplicateValue = (err: any) => {
  return new AppError(
    "Duplicate value. Please use another value!",
    400
  );
};

const handleDatabaseError = (err: any) => {
  console.error("DATABASE ERROR:", err);

  return new AppError(
    "Invalid database operation.",
    400
  );
};

// ERROR RESPONSE
const sendErrorDev = (err: any, req: any, res: any) => {
  return res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, req: any, res: any) => {
  // Operational / trusted error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unknown error
  console.error("ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong.",
  });
};

// GLOBAL ERROR HANDLER
const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 1. ZOD
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};

    err.issues.forEach((issue) => {
      const path = issue.path.join(".") || "general";
      formattedErrors[path] = issue.message;
    });

    return res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors: formattedErrors,
    });
  }

  // 2. JWT
  if (err instanceof jwt.TokenExpiredError) {
    err = handleJWTExpiredError();
  }

  if (err instanceof jwt.JsonWebTokenError) {
    err = handleJWTError();
  }

  // 3. Duplicate database value
  if (err.code === "23505") {
    err = handleDuplicateValue(err);
  }

  // 4. Other PostgreSQL errors
  if (err.code === "22P02") {
    err = handleDatabaseError(err);
  }

  // 5. AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 6. Development
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  // 7. Production
  return sendErrorProd(err, req, res);
};

export default globalErrorHandler;