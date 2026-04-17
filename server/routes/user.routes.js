import { Router } from "express";
import jwt from "jsonwebtoken";
import {
    createUser,
    getMe,
    getUserById,
    listUsers,
    updateUser,
} from "../controllers/user.controller.js";

const router = Router();

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token is required" });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    return next();
}

router.get("/me", authenticate, getMe);
router.post("/", authenticate, requireAdmin, createUser);
router.get("/", authenticate, requireAdmin, listUsers);
router.get("/:id", authenticate, requireAdmin, getUserById);
router.patch("/:id", authenticate, requireAdmin, updateUser);

export default router;
