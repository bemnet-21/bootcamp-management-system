import { Router } from "express";
import jwt from "jsonwebtoken";
import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateStatus,
    updateUser,
} from "../controllers/user.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";

const router = Router();



router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), listUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.patch("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);
router.patch("/:id/status", protect, restrictTo("Admin"), updateStatus)
export default router;
