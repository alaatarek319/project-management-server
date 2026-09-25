import jwt from "jsonwebtoken";
import { db } from "../../db/index.js";
import { refreshToken as refreshTokenTable } from "../../db/schema.js";

export const generateAccessAndRefreshTokens = async (userId: number) => {
    const payload = {
        id: userId,
    };
    const accessSecret = process.env.JWT_ACCESS_SECRET || "default_access_secret";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
    // 1. Generate Access Token (Short Life: 15m)
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: "15m" });
    // 2. Generate Refresh Token (Long Life: 30d)
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "30d" });
    // 3. Save Refresh Token to Database using Drizzle ORM (30 days)
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokenTable).values({
        token: refreshToken,
        userId,
        expires_at,
    });
    return { accessToken, refreshToken };
};
