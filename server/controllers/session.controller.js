import mongoose from "mongoose";
import Session from "../models/Session.model.js";
import { sendError, sendResponse } from "../utils/response.js";

export async function listSessions(req, res, next) {
    try {
        const { division, status } = req.query ?? {};
        const filter = {};

        if (division) {
            if (!mongoose.isValidObjectId(String(division))) {
                return sendError(res, {
                    status: 400,
                    error: "Validation Error",
                    message: "division must be a valid MongoDB ObjectId.",
                });
            }
            filter.division = division;
        }

        if (status) {
            filter.status = status;
        }

        const sessions = await Session.find(filter)
            .populate("division instructor")
            .sort({ startTime: 1 })
            .lean();

        return sendResponse(res, {
            status: 200,
            success: true,
            data: sessions,
            message: "Sessions fetched successfully.",
        });
    } catch (err) {
        return next(err);
    }
}

export async function getSessionById(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "Invalid session id.",
            });
        }

        const session = await Session.findById(id).populate("division instructor").lean();
        if (!session) {
            return sendError(res, {
                status: 404,
                error: "Not Found",
                message: "Session not found.",
            });
        }

        return sendResponse(res, {
            status: 200,
            success: true,
            data: session,
            message: "Session fetched successfully.",
        });
    } catch (err) {
        return next(err);
    }
}
