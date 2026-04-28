import z from "zod";
import NotificationsModel from "../models/Notifications.model.js"
import UserModel from "../models/User.model.js";

const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20)
});

export const getNotifications = async (req, res) => {
    const parseResult = paginationSchema.safeParse(req.query);
    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ 
            error: "Invalid query parameters",
            message: errors
        });
    }
    try {
        const { page, limit } = parseResult.data;
        const notifications = await NotificationsModel.find({ userId: req.user.id })
                                                      .sort({ createdAt: -1 })
                                                      .skip((page - 1) * limit)
                                                      .limit(limit);
                                                
        if(notifications.length === 0) return res.status(200).json({ 
            message: "No notifications found",
            data: []
         })
        res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message,
         });
    }
}

export const unreadCount = async (req, res) => {
    try {
        const count = await NotificationsModel.countDocuments({ userId: req.user.id, isRead: false });

        res.status(200).json({
            message: "Unread notifications count retrieved successfully",
            data: { unreadCount: count }
        });
    }  catch (err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message,
         });
    }
}

const markAsReadSchema = z.object({ 
    notificationId: z.string().min(1, "Notification ID is required")
 })
export const markAsRead = async (req, res) => {
    const parseResult = markAsReadSchema.safeParse(req.params);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ 
            error: "Validation Error",
            message: errors
        });
    }

    try {
        const { notificationId } = parseResult.data;
        const notification = await NotificationsModel.findOne({ _id: notificationId, userId: req.user.id });
        if (!notification) {
            return res.status(404).json({
                error: "Notification not found",
                message: "The notification you are trying to mark as read does not exist"
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: "Notification marked as read successfully",
            data: notification
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
}

export const markAllAsRead = async (req, res) => {
    try {
        const result = await NotificationsModel.updateMany(
            { userId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            message: "All notifications marked as read successfully",
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
}

export const deleteNotification = async (req, res) => {
    const parseResult = markAsReadSchema.safeParse(req.params);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ 
            error: "Validation Error",
            message: errors
        });
    }

    try {
        const { notificationId } = parseResult.data;
        const notification = await NotificationsModel.findOneAndDelete({ _id: notificationId, userId: req.user.id });
        if (!notification) {
            return res.status(404).json({
                error: "Notification not found",
                message: "The notification you are trying to delete does not exist"
            });
        }

        res.status(200).json({
            message: "Notification deleted successfully",
            data: notification
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
}

const preferenceSchema = z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
    types: z.object({
        sessions: z.boolean().optional(),
        grading: z.boolean().optional(),
        bootcamp: z.boolean().optional(),
        group: z.boolean().optional(),
        task: z.boolean().optional(),
    }).optional()
})

export const updateUserNotificationPreference = async (req, res) => {
    const userId = req.user.id;
    const parseResult = preferenceSchema.safeParse(req.body);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ 
            error: "Validation Error",
            message: errors
        });
    }
    try {
        const preferences = parseResult.data;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "The user for whom you are trying to update preferences does not exist"
            });
        }

        if(preferences.email !== undefined) user.notificationPreferences.email = preferences.email;
        if(preferences.inApp !== undefined) user.notificationPreferences.inApp = preferences.inApp;
        if(preferences.types !== undefined) {
            user.notificationPreferences.types.sessions = preferences.types.sessions ?? user.notificationPreferences.types.sessions;
            user.notificationPreferences.types.grading = preferences.types.grading ?? user.notificationPreferences.types.grading;
            user.notificationPreferences.types.bootcamp = preferences.types.bootcamp ?? user.notificationPreferences.types.bootcamp;
            user.notificationPreferences.types.group = preferences.types.group ?? user.notificationPreferences.types.group;
            user.notificationPreferences.types.task = preferences.types.task ?? user.notificationPreferences.types.task;
        }
        await user.save();

        res.status(200).json({
            message: "Notification preferences updated successfully",
            data: user.notificationPreferences
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }

}