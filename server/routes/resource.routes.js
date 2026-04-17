import express from "express";
import {
    createResource,
    getResources,
    downloadResource,
    deleteResource,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.post("/resources", createResource);
router.get("/resources", getResources);
router.get("/resources/:id/download", downloadResource);
router.delete("/resources/:id", deleteResource);

export default router;