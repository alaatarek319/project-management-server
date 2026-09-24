import { z } from "zod";
export const signupSchema = z
    .object({
    email: z.string().email({ message: "Invalid email address" }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
        .string()
        .min(6, { message: "Confirm Password must be at least 6 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .strict();
    
export const loginSchema = z
    .object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
})
    .strict();
    
export const forgotPasswordSchema = z
    .object({
    email: z.string().email({ message: "Invalid email address" }),
})
    .strict();
export const resetPasswordSchema = z
    .object({
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
})
    .strict();
