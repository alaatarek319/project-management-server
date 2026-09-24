import bcrypt from "bcrypt";
import catchAsync from "../utils/catchAsync.js";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

export const getUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the user ID",
        });
    }

    const user = await db.select({
        username: users.username,
        email: users.email,
    }).from(users).where(eq(users.id, Number(id)));

    if (!user) {
        return res.status(404).json({
        status: "fail",
        message: "User not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "User fetched successfully",
        data: user,
    });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
    const { username, email } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the user ID",
        });
    }

    if (!username || !email) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide all the required fields",
        });
    }

    const updatedUser = await db.update(users).set({
        username,
        email,
    }).where(eq(users.id, Number(id)));

    if (!updatedUser) {
        return res.status(404).json({
        status: "fail",
        message: "User not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: updatedUser,
    });
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
      status: "fail",
      message: "Please provide the user ID",
      });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
      status: "fail",
      message: "Please provide all the required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
      status: "fail",
      message: "Passwords do not match",
      });
    }

    const user = await db.select().from(users).where(eq(users.id, Number(id)));

    if (!user) {
        return res.status(404).json({
        status: "fail",
        message: "User not found",
        });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user[0].password);

    if (!isPasswordCorrect) {
        return res.status(401).json({
        status: "fail",
        message: "Incorrect current password",
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await db.update(users).set({
        password: hashedPassword,
    }).where(eq(users.id, Number(id)));

    if (!updatedUser) {
        return res.status(404).json({
        status: "fail",
        message: "User not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "Password updated successfully",
    });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
        status: "fail",
        message: "Please provide the user ID",
        });
    }

    const deletedUser = await db.delete(users).where(eq(users.id, Number(id)));

    if (!deletedUser) {
        return res.status(404).json({
        status: "fail",
        message: "User not found",
        });
    }

    res.status(200).json({
        status: "success",
        message: "User deleted successfully",
    });
}); 