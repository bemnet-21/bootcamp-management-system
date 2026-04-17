import { Router } from "express";
import { getSessionById, listSessions } from "../controllers/session.controller.js";

const router = Router();

router.get("/", listSessions);
router.get("/:id", getSessionById);

export default router;
