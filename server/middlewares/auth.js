import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { sendError } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "vanguard-dev-secret";

/**
 * Auth middleware:
 * - Preferred: Authorization: Bearer <jwt> (expects payload `id` or `userId`)
 * - Fallback (temporary/dev): X-User-Id header with a Mongo ObjectId
 */
export async function auth(req, res, next) {
    try {
        const authHeader = String(req.headers.authorization || "");
        const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";

        let userId = null;

        if (bearer) {
            let payload;
            try {
                payload = jwt.verify(bearer, JWT_SECRET);
            } catch (err) {
                return sendError(res, { status: 401, error: "Unauthorized", message: "Invalid or expired token." });
            }
            userId = payload?.id || payload?.userId || null;
        } else {
            const headerUserId = req.headers["x-user-id"];
            if (headerUserId !== undefined) userId = String(headerUserId).trim();
        }

        if (!userId) {
            return sendError(res, { status: 401, error: "Unauthorized", message: "Authentication is required." });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return sendError(res, { status: 400, error: "Validation Error", message: "Invalid user id." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendError(res, { status: 401, error: "Unauthorized", message: "User not found." });
        }

        req.user = user;
        return next();
    } catch (err) {
        return next(err);
    }
}

// Alias to match common naming in other modules.
export const protect = auth;
