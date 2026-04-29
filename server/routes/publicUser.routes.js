import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import protect from "../middlewares/auth.js";

/**
 * Public user routes - accessible to all authenticated users
 * Used by instructors and helpers to search for users when creating sessions, adding helpers, etc.
 */

const router = Router();

// List users - accessible to all authenticated users
router.get("/", protect, listUsers);

export default router;
