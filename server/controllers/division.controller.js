import mongoose from "mongoose";
import Division from "../models/Division.model.js";
import { sendError, sendResponse } from "../utils/response.js";
import {
  createDivisionSchema,
  updateDivisionSchema,
} from "../validators/division.validation.js";
import { ZodError } from "zod";

import {
  createDivision,
  getDivisionStatistics,
  listDivisionsWithStats,
  updateDivision,
  deleteDivision,
  reactivateDivision,
  getDivisionById,
} from "../services/division.service.js";

// create a new division

export async function createDivisionHandler(req, res, next) {
  try {
    const value = createDivisionSchema.parse(req.body);
    const created = await createDivision(value);
    return sendResponse(res, {
      status: 201,
      success: true,
      data: created,
      message: "Division created successfully.",
    });
  } catch (err) {
    if (err?.code === 11000) {
      return sendError(res, {
        status: 409,
        error: "Conflict",
        message: "A division with this name already exists.",
      });
    }
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message:
          "Invalid input data. Please check required fields and formats.",
      });
    }
    return next(err);
  }
}

// list divisions

export async function listDivisions(req, res, next) {
  try {
    const divisions = await listDivisionsWithStats();

    if (!divisions || divisions.length === 0) {
      return sendResponse(res, {
        status: 200,
        success: true,
        data: [],
        message: "No divisions found.",
      });
    }
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

// update a division

export async function updateDivisionHandler(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: "Invalid division id.",
      });
    }

    const value = updateDivisionSchema.parse(req.body);

    const updated = await updateDivision(id, value);
    if (!updated) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "Division not found.",
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      data: updated,
      message: "Division updated successfully.",
    });
  } catch (err) {
    if (err?.code === 11000) {
      return sendError(res, {
        status: 409,
        error: "Conflict",
        message: "A division with this name already exists.",
      });
    }
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message:
          "Invalid input data. Please check required fields and formats.",
      });
    }
    return next(err);
  }
}

// get single division detail

// get division statistics

export async function getDivisionStatisticsHandler(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: "Invalid division id.",
      });
    }

    const exists = await Division.exists({ _id: id });
    if (!exists) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "Division not found.",
      });
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

export async function getDivisionDetail(req, res, next) {
  try {
    const { id } = req.params;

    // validate id format
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: "Invalid division id.",
      });
    }

    const division = await getDivisionById(id);

    //   if division not found
    if (!division) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "Division not found.",
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      data: division,
      message: "Division fetched successfully.",
    });
  } catch (err) {
    return next(err);
  }
}

//delete division
export async function deleteDivisionHandler(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: "Invalid division id.",
      });
    }

    const deleted = await deleteDivision(id);

    if (!deleted) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "Division not found.",
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      data: deleted,
      message: "Division deleted successfully.",
    });
  } catch (err) {
    return next(err);
  }
}

//reactivate division
export async function reactivateDivisionHandler(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: "Invalid division id.",
      });
    }

    const reactivated = await reactivateDivision(id);

    if (!reactivated) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "Division not found or already active.",
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      data: reactivated,
      message: "Division reactivated successfully.",
    });
  } catch (err) {
    return next(err);
  }
}
