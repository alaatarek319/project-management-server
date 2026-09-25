import { Router } from "express";
import {
  signup,
  login,
  logout,
  getMe,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  getUser,
  updateMe,
  updatePassword,
  deleteUser,
} from "../controllers/usersController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public auth routes
router.post("/register", signup);
router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Protected auth routes
router.use(verifyToken);
// Me
router.get("/me", getMe);
router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.delete("/delete-me", deleteUser);
router.post("/logout", logout);

router.get("/:id", getUser);

export default router;
