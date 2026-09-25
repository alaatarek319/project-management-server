import bcrypt from "bcrypt";
import crypto from "crypto";
import type { CookieOptions } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, refreshToken as refreshTokenTable,  } from "../db/schema.js";

import { generateAccessAndRefreshTokens } from "../utils/auth/generateToken.js";
import { sendEmail } from "../utils/auth/email.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authSchema.js";

// Cookie configuration for secure token storage
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
};

const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

// --- 1. SIGNUP ---
export const signup = catchAsync(async (req, res, next) => {
  // Validate input using Zod schema
  const { email, username, password} = signupSchema.parse(req.body);

  // Check if email or username already exists
  const existingUser = await db.query.users.findFirst({
    where: (user, { or, eq }) =>
      or(eq(user.email, email), eq(user.username, username)),
    columns: {
      id: true,
    },
  });

  if (existingUser) {
    return next(new AppError("Email or Username already in use", 400));
  }

  // Hash password with bcrypt (10 rounds of salt)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user and profile in a transaction (ensures data integrity)
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      username,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
    });

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    newUser.id,
  );

  // Set tokens in HTTP-only cookies
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
  });

  // Send success response with user data
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// --- 2. LOGIN ---
export const login = catchAsync(async (req, res, next) => {
  // Validate input email 
  const { email, password } = loginSchema.parse(req.body);

  // Find user by email
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
    columns: {
      id: true,
      username: true,
      email: true,
      password: true,
    },
  });

  // Check if user exists
  if (!user) {
    return next(new AppError("User not found with that email/username", 404));
  }

  // Verify password using bcrypt
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError("Incorrect password", 401));
  }

  // Generate new tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id,
  );

  // Set tokens in cookies
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Send sanitized user data
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

// 3. LOGOUT
export const logout = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  // Remove refresh token from database
  if (incomingRefreshToken) {
    await db
      .delete(refreshTokenTable)
      .where(eq(refreshTokenTable.token, incomingRefreshToken));
  }

  // Clear access token cookie
  res.clearCookie("accessToken", clearCookieOptions);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", clearCookieOptions);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// 4. GET CURRENT USER
export const getMe = catchAsync(async (req, res, next) => {
  // req.user is created by authentication middleware
  const userId = req.user.id;

  const foundUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
    columns: {
      username: true,
      email: true,
    },
  });

  // User may have been deleted
  // while the access token is still valid
  if (!foundUser) {
    return next(new AppError("User no longer exists", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: foundUser,
    },
  });
});

// 5. REFRESH ACCESS TOKEN
export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  // Check if refresh token exists
  if (!incomingRefreshToken) {
    return next(new AppError("No refresh token provided", 401));
  }

  // Verify JWT

  let decoded: JwtPayload;

  try {
    const verified = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    );

    if (typeof verified === "string") {
      return next(new AppError("Invalid refresh token", 403));
    }

    decoded = verified;
  } catch {
    return next(new AppError("Invalid or expired refresh token", 403));
  }

  // Make sure JWT contains user ID
  if (!decoded.id) {
    return next(new AppError("Invalid refresh token payload", 403));
  }

  // Check token exists in database

  const savedToken = await db.query.refreshToken.findFirst({
    where: (refreshToken, { eq }) =>
      eq(refreshToken.token, incomingRefreshToken),
  });

  if (!savedToken) {
    return next(new AppError("Refresh token revoked or invalid", 403));
  }

  // Check database expiration

  if (savedToken.expires_at < new Date()) {
    // Delete expired token
    await db
      .delete(refreshTokenTable)
      .where(eq(refreshTokenTable.id, savedToken.id));

    return next(new AppError("Refresh token has expired", 403));
  }

  // Check user still exists

  const foundUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, decoded.id as number),
    columns: {
      id: true,
    },
  });

  if (!foundUser) {
    return next(
      new AppError("User belonging to this token no longer exists", 401),
    );
  }

  // Generate new access token

  const newAccessToken = jwt.sign(
    {
      id: foundUser.id,
    },

    process.env.JWT_ACCESS_SECRET || "default_access_secret",

    {
      expiresIn: "15m",
    },
  );

  // Send new access token cookie
  res.cookie("accessToken", newAccessToken, cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Access token refreshed",
  });
});

// 6. FORGOT PASSWORD
export const forgotPassword = catchAsync(async (req, res, next) => {
  // Validate email
  const { email } = forgotPasswordSchema.parse(req.body);

  // Find user by email
  const foundUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  if (!foundUser) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing it
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token valid for 10 minutes
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Save reset token in database
  await db
    .update(users)
    .set({
      passwordResetToken: hashedToken,
      passwordResetExpires,
    })
    .where(eq(users.id, foundUser.id));

  // Create reset URL
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email template
  const htmlMessage = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Reset Your Password</h2>

        <p>
          Click the button below to reset your password.
          The link is valid for 10 minutes.
        </p>

        <a
          href="${resetURL}"
          style="
            background-color: #00d4ff;
            color: #000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>
    `;

  // Send email
  try {
    await sendEmail({
      email: foundUser.email,
      subject: "Reset Your Password",
      message: `Reset link: ${resetURL}`,
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    // Email failed → remove reset token
    await db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.id, foundUser.id));

    return next(
      new AppError("Email could not be sent. Please try again later.", 500),
    );
  }
});

// 7. RESET PASSWORD
export const resetPassword = catchAsync(async (req, res, next) => {
  const rawToken = Array.isArray(req.params.token)
    ? req.params.token[0]
    : req.params.token;

  if (!rawToken || typeof rawToken !== "string") {
    return next(new AppError("Reset token is required in the URL", 400));
  }

  // Validate new password
  const { password } = resetPasswordSchema.parse(req.body);

  // Hash token from URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Find user with valid reset token
  const foundUser = await db.query.users.findFirst({
    where: (user, { and, eq, gt }) =>
      and(
        eq(user.passwordResetToken, hashedToken),
        gt(user.passwordResetExpires, new Date()),
      ),
  });

  if (!foundUser) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password + clear reset
  await db
    .update(users)
    .set({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    })
    .where(eq(users.id, foundUser.id));

  // Response
  res.status(200).json({
    status: "success",
    message: "Password reset successful! Please log in with your new password.",
  });
});
