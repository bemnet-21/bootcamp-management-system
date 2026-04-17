import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { sendError, sendResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "vanguard-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function publicUser(doc) {
    if (!doc) return null;
    const user = doc.toObject ? doc.toObject() : { ...doc };
    delete user.password;
    delete user.refreshToken;
    return user;
}

async function comparePassword(inputPassword, storedPassword) {
    if (!storedPassword) return false;

    if (storedPassword.startsWith("$2")) {
        return bcrypt.compare(inputPassword, storedPassword);
    }

    return inputPassword === storedPassword;
}

function signToken(user) {
    return jwt.sign(
        {
            id: String(user._id),
            userId: String(user._id),
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return sendError(res, {
                status: 400,
                error: "Validation Error",
                message: "email and password are required.",
            });
        }

        const user = await User.findOne({ email: String(email).trim().toLowerCase() }).populate("divisions");
        if (!user) {
            return sendError(res, {
                status: 401,
                error: "Unauthorized",
                message: "Invalid email or password.",
            });
        }

        const isValidPassword = await comparePassword(String(password), String(user.password));
        if (!isValidPassword) {
            return sendError(res, {
                status: 401,
                error: "Unauthorized",
                message: "Invalid email or password.",
            });
        }

        const token = signToken(user);

        return sendResponse(res, {
            status: 200,
            success: true,
            data: {
                token,
                user: publicUser(user),
            },
            message: "Login successful.",
        });
    } catch (err) {
        return next(err);
    }
}

export async function getAuthenticatedUser(req, res, next) {
    try {
        const populatedUser = await req.user.populate("divisions");

        return sendResponse(res, {
            status: 200,
            success: true,
            data: publicUser(populatedUser),
            message: "Authenticated user fetched successfully.",
        });
    } catch (err) {
        return next(err);
    }
}
