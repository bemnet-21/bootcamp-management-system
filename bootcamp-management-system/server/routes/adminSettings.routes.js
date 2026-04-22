import { Router } from "express";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";
import {
  getAdminProfile,
  updateAdminPassword,
  updateAdminProfile,
} from "../controllers/adminSettings.controller.js";

const router = Router();

router.use(protect);
router.use(restrictTo("Admin"));

router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.post("/password", updateAdminPassword);

export default router;
