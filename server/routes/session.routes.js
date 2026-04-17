import express from "express";
import {
  createSession,
  getSingleSession,
  getSeassions,
  updateSession,
  deleteSession,
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getSeassions);
router.get("/:id", getSingleSession);
router.patch("/:id", updateSession);
router.delete("/:id", deleteSession);

export default router;
