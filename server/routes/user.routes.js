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

const router = Router();

function requireAdmin(req, res, next) {
    if (req.user?.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    return next();
}

router.get("/me", protect, getMe);
router.post("/", protect, requireAdmin, createUser);
router.get("/", protect, requireAdmin, listUsers);
router.get("/:id", protect, requireAdmin, getUserById);
router.patch("/:id", protect, requireAdmin, updateUser);
router.delete("/:id", protect, requireAdmin, deleteUser);
export default router;
