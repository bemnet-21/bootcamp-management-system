import { sendError } from "../utils/response.js";

export function checkRole(requiredRole) {
    const required = String(requiredRole || "").toLowerCase();
    return function checkRoleMiddleware(req, res, next) {
        const role = String(req.user?.role || "").toLowerCase();
        if (!role) {
            return sendError(res, { status: 401, error: "Unauthorized", message: "Authentication is required." });
        }
        if (role !== required) {
            return sendError(res, { status: 403, error: "Forbidden", message: "Insufficient permissions." });
        }
        return next();
    };
}

export const restrictTo = checkRole;
