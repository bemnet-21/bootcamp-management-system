import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import Division from "../models/Division.model.js";
import { sendError, sendResponse } from "../utils/response.js";
import z from "zod";
import transporter from "../utils/mailer.js";
import crypto from "crypto";


const ROLES = ["Admin", "Instructor", "Student"];
const STATUSES = ["Active", "Suspended", "Graduated"];

function generateRandomPassword(length = 12) {
    return crypto.randomBytes(length).toString("base64").replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
}
const BCRYPT_ROUNDS = 10;

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


const createUserSchema = z.object({
    firstName: z.string().min(2, "firstName is required."),
    lastName: z.string().min(2, "lastName is required."),
    username: z.string().min(3, "username is required."),
    email: z.string().email("Invalid email address."),
    role: z.enum(ROLES, { errorMap: () => ({ message: `role must be one of: ${ROLES.join(", ")}.` }) }),
    divisions: z.array(z.string()),
    status: z.enum(STATUSES, { errorMap: () => ({ message: `status must be one of: ${STATUSES.join(", ")}.` }) }),
})

export async function createUser(req, res) {
    const parseResult = createUserSchema.safeParse(req.body ?? {});
    if (!parseResult.success) {
        const error = parseResult.error.errors[0];
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: error.message,
        });
    }
    const { firstName, lastName, username, email, role, divisions, status } = parseResult.data;

    const randomPassword = generateRandomPassword(12);

    // Validate division IDs
    for (const id of divisions) {
        if (!mongoose.isValidObjectId(id)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "Each division must be a valid MongoDB ObjectId.",
            });
        }
    }
    if (divisions.length > 0) {
        const count = await Division.countDocuments({
            _id: { $in: divisions.map((id) => new mongoose.Types.ObjectId(id)) },
        });
        if (count !== divisions.length) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "One or more division ids do not exist.",
            });
        }
    }

    try {
        const passwordHash = await bcrypt.hash(String(randomPassword), BCRYPT_ROUNDS);
        const created = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            username: String(username).trim(),
            email: String(email).trim().toLowerCase(),
            password: passwordHash,
            role,
            divisions,
            status,
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Account Has Been Created",
            text: `Hello ${firstName},\n\nYour account has been created. Your temporary password is: ${randomPassword}\nPlease log in and change your password as soon as possible.\n\nThank you.`,
        });
        const populated = await User.findById(created._id).populate("divisions");
        return sendResponse(res, {
            status: 201,
            success: true,
            data: publicUser(populated),
            message: "User created successfully. A password has been sent to the user's email.",
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

    const { role, division, status, page = 1, limit = 20, search } = req.query;
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
    if (status !== undefined && status !== "") {
        if (!STATUSES.includes(status)) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: `status query must be one of: ${STATUSES.join(", ")}.`,
            });
        }
        filter.status = status;
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
            return sendResponse(res, {
                status: 200,
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: parseInt(page, 10) || 1,
                    limit: parseInt(limit, 10) || 20,
                    totalPages: 0,
                },
                message: "No users found for the given division filter.",
            });
        }
        filter.divisions = resolved;
    }


    // Search filter for username or firstName + lastName
    let searchFilter = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
        const searchStr = search.trim();
        // If search contains a space, try to match firstName + lastName
        if (searchStr.includes(' ')) {
            const [first, ...rest] = searchStr.split(' ');
            const last = rest.join(' ');
            searchFilter = {
                $or: [
                    { username: { $regex: searchStr, $options: 'i' } },
                    {
                        $and: [
                            { firstName: { $regex: first, $options: 'i' } },
                            { lastName: { $regex: last, $options: 'i' } }
                        ]
                    }
                ]
            };
        } else {
            // Single word: match username, firstName, or lastName
            searchFilter = {
                $or: [
                    { username: { $regex: searchStr, $options: 'i' } },
                    { firstName: { $regex: searchStr, $options: 'i' } },
                    { lastName: { $regex: searchStr, $options: 'i' } }
                ]
            };
        }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const finalFilter = Object.keys(searchFilter).length > 0
        ? { ...filter, ...searchFilter }
        : filter;

    const total = await User.countDocuments(finalFilter);
    const users = await User.find(finalFilter)
        .populate("divisions")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    for (const u of users) {
        delete u.password;
        delete u.refreshToken;
    }
    return sendResponse(res, {
        status: 200,
        success: true,
        data: users,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
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
        updates.password = await bcrypt.hash(String(updates.password), BCRYPT_ROUNDS);
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

export async function updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: "Invalid user id.",
        });
    }

    if (!STATUSES.includes(status)) {
        return sendError(res, {
            status: 400,
            error: "Validation Error",
            message: `status must be one of: ${STATUSES.join(", ")}.`,
        });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
    )
    if (!user) return sendError(res, { status: 404, error: "Not Found", message: "User not found." });

    return sendResponse(res, {
        status: 200,
        success: true,
        data: publicUser(user),
        message: "User status updated successfully.",
    });
}

export async function listUsers(req, res) {
  const { role, division, status, page = 1, limit = 20 } = req.query;
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
  if (status !== undefined && status !== "") {
    if (!STATUSES.includes(status)) {
      return sendError(res, {
        status: 400,
        error: "Validation Error",
        message: `status query must be one of: ${STATUSES.join(", ")}.`,
      });
    }
    filter.status = status;
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
      return sendResponse(res, {
        status: 200,
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 20,
          totalPages: 0,
        },
        message: "No users found for the given division filter.",
      });
    }
    filter.divisions = resolved;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate("divisions")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();
  for (const u of users) {
    delete u.password;
    delete u.refreshToken;
  }
  return sendResponse(res, {
    status: 200,
    success: true,
    data: users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    message: "Users fetched successfully.",
  });
}
