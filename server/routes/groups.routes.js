import express from "express";
import { createGroup } from "../controllers/groups.controller.js";
const router = express.Router();

router.post("/:bootcampId", createGroup);

export default router;
