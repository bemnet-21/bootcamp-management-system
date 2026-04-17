import mongoose from "mongoose";
import Division from "../models/Division.model.js";
import { sendError, sendResponse } from "../utils/response.js";
import { validateCreateDivision, validateUpdateDivision } from "../validators/division.validation.js";
import {
    createDivision,
    getDivisionStatistics,
    listDivisionsWithStats,
    updateDivision,
} from "../services/division.service.js";

export async function listDivisions(req, res, next) {
    try {
        const divisions = await listDivisionsWithStats();
        return sendResponse(res, {
            status: 200,
            success: true,
            data: divisions,
            message: "Divisions fetched successfully.",
        });
    } catch (err) {
        return next(err);
    }
}

export async function createDivisionHandler(req, res, next) {
    try {
        const { value, error } = validateCreateDivision(req.body);
        if (error) return sendError(res, { status: error.status, error: "Validation Error", message: error.message });

        const created = await createDivision(value);
        return sendResponse(res, {
            status: 201,
            success: true,
            data: created,
            message: "Division created successfully.",
        });
    } catch (err) {
        if (err?.code === 11000) {
            return sendError(res, { status: 409, error: "Conflict", message: "A division with this name already exists." });
        }
        return next(err);
    }
}

export async function getDivisionStatisticsHandler(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return sendError(res, { status: 400, error: "Validation Error", message: "Invalid division id." });
        }

        const exists = await Division.exists({ _id: id });
        if (!exists) {
            return sendError(res, { status: 404, error: "Not Found", message: "Division not found." });
        }

        const stats = await getDivisionStatistics(id);
        return sendResponse(res, {
            status: 200,
            success: true,
            data: stats,
            message: "Division statistics fetched successfully.",
        });
    } catch (err) {
        return next(err);
    }
}

export async function updateDivisionHandler(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return sendError(res, { status: 400, error: "Validation Error", message: "Invalid division id." });
        }

        const { value, error } = validateUpdateDivision(req.body);
        if (error) return sendError(res, { status: error.status, error: "Validation Error", message: error.message });

        const updated = await updateDivision(id, value);
        if (!updated) {
            return sendError(res, { status: 404, error: "Not Found", message: "Division not found." });
        }

        return sendResponse(res, {
            status: 200,
            success: true,
            data: updated,
            message: "Division updated successfully.",
        });
    } catch (err) {
        if (err?.code === 11000) {
            return sendError(res, { status: 409, error: "Conflict", message: "A division with this name already exists." });
        }
        return next(err);
    }
}

