import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import Division from "../models/Division.model.js";
import { sendError, sendResponse } from "../utils/response.js";

import bcrypt from "bcrypt";

const ROLES = ["Admin", "Instructor", "Student"];
const STATUSES = ["Active", "Suspended", "Graduated"];

function permissionsForRole(role) {
    switch (role) {
        case "Admin":
            return {
                manageUsers: true,
                manageDivisions: true,
                manageGroups: true,
                overrideSchedulesAndAttendance: true,
                accessReportsAndAnalytics: true,
            };
        case "Instructor":
            return {
                createAndManageSessions: true,
                markAttendance: true,
                uploadResources: true,
                createTasksAndReviewSubmissions: true,
                viewFeedbackAggregated: true,
            };
        case "Student":
            return {
                viewSessionsAndResources: true,
                checkInAttendance: true,
                submitTasks: true,
                rateSessionsAndGiveFeedback: true,
                submitWeeklyGroupProgress: true,
            };
        default:
            return {};
    }
}

function publicUser(doc) {
    if (!doc) return null;
    const o = doc.toObject ? doc.toObject() : { ...doc };
    delete o.password;
    delete o.refreshToken;
    return o;
}

async function resolveDivisionFilter(divisionParam) {
    if (!divisionParam) return null;
    const raw = String(divisionParam).trim();
    if (!raw) return null;
    if (mongoose.isValidObjectId(raw)) {
        const d = await Division.findById(raw).lean();
        return d ? d._id : { invalid: true };
    }
    const byName = await Division.findOne({ name: raw }).lean();
    return byName ? byName._id : { notFound: true };
}

/**
 * GET /users/me — temporary: send X-User-Id (Mongo ObjectId) until JWT auth exists.
 */
export async function getMe(req, res) {
    const userId = req.headers["x-user-id"];
    if (!userId || String(userId).trim() === "") {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "X-User-Id header is required until JWT authentication is available.",
        });
    }
    if (!mongoose.isValidObjectId(userId)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "X-User-Id must be a valid user id.",
        });
    }
    const user = await User.findById(userId).populate("divisions").lean();
    if (!user) {
        return sendError(res, { status: 404, error: "Not Found", message: "User not found." });
    }
    delete user.password;
    delete user.refreshToken;
    return sendResponse(res, {
        status: 200,
        success: true,
        data: {
            user,
            permissions: permissionsForRole(user.role),
        },
        message: "Authenticated user fetched successfully.",
    });
}

export async function createUser(req, res) {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        divisions = [],
        status,
    } = req.body ?? {};

    if (!firstName || !lastName || !username || !email || !password || !role) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message:
                "firstName, lastName, username, email, password, and role are required.",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!ROLES.includes(role)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: `role must be one of: ${ROLES.join(", ")}.`,
        });
    }
    if (status !== undefined && !STATUSES.includes(status)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: `status must be one of: ${STATUSES.join(", ")}.`,
        });
    }

    const divisionIds = Array.isArray(divisions) ? divisions : [];
    for (const id of divisionIds) {
        if (!mongoose.isValidObjectId(id)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "Each division must be a valid MongoDB ObjectId.",
            });
        }
    }
    if (divisionIds.length > 0) {
        const count = await Division.countDocuments({
            _id: { $in: divisionIds.map((id) => new mongoose.Types.ObjectId(id)) },
        });
        if (count !== divisionIds.length) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "One or more division ids do not exist.",
            });
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(String(password), 10);
        const created = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            username: String(username).trim(),
            email: String(email).trim().toLowerCase(),
            password: hashedPassword,
            role,
            divisions: divisionIds,
            ...(status !== undefined ? { status } : {}),
        });
        const populated = await User.findById(created._id).populate("divisions");
        return sendResponse(res, {
            status: 201,
            success: true,
            data: publicUser(populated),
            message: "User created successfully.",
        });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || "field";
            return sendError(res, {
                status: 409,
                error: "Conflict",
                message: `A user with this ${field} already exists.`,
            });
        }
        throw err;
    }
}

export async function listUsers(req, res) {
    const { role, division } = req.query;
    const filter = {};

    if (role !== undefined && role !== "") {
        if (!ROLES.includes(role)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: `role query must be one of: ${ROLES.join(", ")}.`,
            });
        }
        filter.role = role;
    }

    if (division !== undefined && division !== "") {
        const resolved = await resolveDivisionFilter(division);
        if (resolved?.invalid) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "Invalid division id.",
            });
        }
        if (resolved?.notFound) {
            return sendError(res, {
                status: 404,
                error: "Not Found",
                message: "No division matches the given filter.",
            });
        }
        filter.divisions = resolved;
    }

    const users = await User.find(filter).populate("divisions").sort({ createdAt: -1 }).lean();
    for (const u of users) {
        delete u.password;
        delete u.refreshToken;
    }
    return sendResponse(res, {
        status: 200,
        success: true,
        data: users,
        message: "Users fetched successfully.",
    });
}

export async function getUserById(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "Invalid user id.",
        });
    }
    const user = await User.findById(id).populate("divisions").lean();
    if (!user) {
        return sendError(res, { status: 404, error: "Not Found", message: "User not found." });
    }
    delete user.password;
    delete user.refreshToken;
    return sendResponse(res, {
        status: 200,
        success: true,
        data: user,
        message: "User fetched successfully.",
    });
}

export async function updateUser(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "Invalid user id.",
        });
    }

    const body = req.body ?? {};
    const allowed = [
        "firstName",
        "lastName",
        "username",
        "email",
        "password",
        "role",
        "divisions",
        "status",
    ];
    const updates = {};
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            updates[key] = body[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "Provide at least one field to update.",
        });
    }

    if (updates.role !== undefined && !ROLES.includes(updates.role)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: `role must be one of: ${ROLES.join(", ")}.`,
        });
    }
    if (updates.status !== undefined && !STATUSES.includes(updates.status)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: `status must be one of: ${STATUSES.join(", ")}.`,
        });
    }
    if (updates.divisions !== undefined) {
        if (!Array.isArray(updates.divisions)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "divisions must be an array of division ObjectIds.",
            });
        }
        for (const did of updates.divisions) {
            if (!mongoose.isValidObjectId(did)) {
                return sendError(res, {
                    status: 400,
                    error: "Validation Error",
                    message: "Each division must be a valid MongoDB ObjectId.",
                });
            }
        }
        const count = await Division.countDocuments({
            _id: {
                $in: updates.divisions.map((x) => new mongoose.Types.ObjectId(x)),
            },
        });
        if (count !== updates.divisions.length) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "One or more division ids do not exist.",
            });
        }
    }
    if (updates.email !== undefined) {
        updates.email = String(updates.email).trim().toLowerCase();
    }
    if (updates.username !== undefined) {
        updates.username = String(updates.username).trim();
    }
    if (updates.firstName !== undefined) {
        updates.firstName = String(updates.firstName).trim();
    }
    if (updates.lastName !== undefined) {
        updates.lastName = String(updates.lastName).trim();
    }
    if (updates.password !== undefined) {
        updates.password = await bcrypt.hash(String(updates.password), 10);
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate("divisions");
        if (!user) {
            return sendError(res, { status: 404, error: "Not Found", message: "User not found." });
        }
        return sendResponse(res, {
            status: 200,
            success: true,
            data: publicUser(user),
            message: "User updated successfully.",
        });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || "field";
            return sendError(res, {
                status: 409,
                error: "Conflict",
                message: `A user with this ${field} already exists.`,
            });
        }
        throw err;
    }
}

export async function deleteUser(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "Invalid user id.",
        });
    }

    const deletedUser = await User.findByIdAndDelete(id).lean();
    if (!deletedUser) {
        return sendError(res, { status: 404, error: "Not Found", message: "User not found." });
    }

    return sendResponse(res, {
        status: 200,
        success: true,
        data: { id },
        message: "User deleted successfully.",
    });
}
