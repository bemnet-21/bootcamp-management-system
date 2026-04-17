import { Router } from "express";
import { getAuthenticatedUser, login } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login);
router.get("/me", protect, getAuthenticatedUser);

export default router;
