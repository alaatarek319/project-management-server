import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import type { Request, Response, NextFunction } from "express";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;

    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    
    // 1. Get token from HTTP-only cookie OR Authorization header (Bearer token)
    let token: string | undefined = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check if token exists
    if (!token) {
      return next(new AppError("You are not logged in. Please log in.", 401));
    }

    // 3. Verify token
    const decoded = jwt.verify(token, accessSecret);

    // 4. Make sure decoded payload has the expected structure
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return next(new AppError("Invalid token payload", 401));
    }

    // 5. Attach user information to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // 6. Continue
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};
