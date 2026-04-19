import express from "express";
import {
  createBootcamp,
  getAllBootcamps,
  assignLeadInstructor,
  getBootcampById,
  deleteBootcamp,
  updateBootcamp,
  softDeleteBootcamp
} from "../controllers/adminBootcamp.controller.js";
import protect from "../middlewares/auth.js";
import { restrictTo } from "../middlewares/checkRole.js";
const router = express.Router();

// protect  for admins only
router.use(protect, restrictTo("Admin"));

router.post("/", createBootcamp);

router.get("/", getAllBootcamps);

// Get single bootcamp by ID
router.get("/:id", getBootcampById);


// Permanent Delete bootcamp
router.delete("/:id", deleteBootcamp);

router.put("/:id", updateBootcamp);

router.patch("/:id/assign-lead", assignLeadInstructor);

router.patch("/:id/deactivate", softDeleteBootcamp);

export default router;
