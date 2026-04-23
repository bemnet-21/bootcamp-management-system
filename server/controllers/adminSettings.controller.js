import bcrypt from "bcrypt";
import UserModel from "../models/User.model.js";
import { sendError, sendResponse } from "../utils/response.js";

export async function getAdminProfile(req, res) {
  try {
    const user = await UserModel.findById(req.user.id).select(
      "firstName lastName username email role"
    );
    if (!user) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "User not found.",
      });
    }
    return sendResponse(res, {
      status: 200,
      success: true,
      data: user,
      message: "Admin settings profile fetched successfully.",
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      error: "Server Error",
      message: "Failed to fetch admin settings profile.",
    });
  }
}

export async function updateAdminProfile(req, res) {
  const { firstName, lastName, username } = req.body || {};
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "User not found.",
      });
    }

    if (typeof firstName === "string" && firstName.trim()) user.firstName = firstName.trim();
    if (typeof lastName === "string" && lastName.trim()) user.lastName = lastName.trim();
    if (typeof username === "string" && username.trim()) user.username = username.trim();

    await user.save();

    return sendResponse(res, {
      status: 200,
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: "Admin profile updated successfully.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return sendError(res, {
        status: 409,
        error: "Conflict",
        message: "Username is already taken.",
      });
    }
    return sendError(res, {
      status: 500,
      error: "Server Error",
      message: "Failed to update admin profile.",
    });
  }
}

export async function updateAdminPassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return sendError(res, {
      status: 400,
      error: "Validation Error",
      message: "Current and new passwords are required.",
    });
  }
  try {
    const user = await UserModel.findById(req.user.id).select("+password");
    if (!user) {
      return sendError(res, {
        status: 404,
        error: "Not Found",
        message: "User not found.",
      });
    }

    const matched = await bcrypt.compare(currentPassword, user.password);
    if (!matched) {
      return sendError(res, {
        status: 401,
        error: "Unauthorized",
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshToken = null;
    await user.save();

    return sendResponse(res, {
      status: 200,
      success: true,
      data: null,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      error: "Server Error",
      message: "Failed to update password.",
    });
  }
}
