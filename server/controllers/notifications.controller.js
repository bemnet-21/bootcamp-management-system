import z from "zod";
import NotificationsModel from "../models/Notifications.model.js"

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