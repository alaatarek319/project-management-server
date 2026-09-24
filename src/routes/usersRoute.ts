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

const router = Router();

// Public auth routes
router.post("/register", signup);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Protected auth routes
router.use(verifyToken);
router.get("/:id", getUser);

// Me
router.get("/me", getMe);
router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.delete("/delete-me", deleteUser);
router.post("/logout", logout);

export default router;
