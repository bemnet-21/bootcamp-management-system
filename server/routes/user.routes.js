import { Router } from "express";
import {
    createUser,
    deleteUser,
    getMe,
    getUserById,
    listUsers,
    updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", getMe);
router.post("/", createUser);
router.get("/", listUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
