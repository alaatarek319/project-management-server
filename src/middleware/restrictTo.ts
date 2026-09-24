import AppError from "../utils/appError.js";
import type { Request, Response, NextFunction } from "express";

// ...roles means we can pass multiple allowed roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("You are not logged in. Please log in.", 401),
      );
    }

    // req.user is set by the verifyToken middleware beforehand
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
