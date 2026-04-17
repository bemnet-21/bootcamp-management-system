import { Router } from "express";
import jwt from "jsonwebtoken";
import {
    createUser,
    deleteUser,
    getMe,
    getUserById,
    listUsers,
    updateUser,
} from "../controllers/user.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";

const router = Router();



router.get("/me", protect, getMe);
router.post("/", protect, restrictTo("Admin"), createUser);
router.get("/", protect, restrictTo("Admin"), listUsers);
router.get("/:id", protect, restrictTo("Admin"), getUserById);
router.patch("/:id", protect, restrictTo("Admin"), updateUser);
router.delete("/:id", protect, restrictTo("Admin"), deleteUser);
export default router;
