import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { sendError } from "../utils/response.js";

import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET

/**
 * Auth middleware:
 * - Preferred: Authorization: Bearer <jwt> (expects payload `id` or `userId`)
 * - Fallback (temporary/dev): X-User-Id header with a Mongo ObjectId
 */
function protect(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token is required" });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}

export default protect;