import z from "zod"
import SessionModel from "../models/Session.model.js";
import FeedbackModel from "../models/Feedback.model.js";

const getFeedbackPerBootcampSchema = z.object({
    bootcampId: z.string().min(1, "Bootcamp ID is required")
})
export const getFeedbackPerBootcamp = async (req, res) => {
    const parseResult = getFeedbackPerBootcampSchema.safeParse(req.params);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        return res.status(400).json({ 
            error: "Validation Error",
            message: errors
         })
    }

    try {
        const { bootcampId } = parseResult.data
        const sessions = await SessionModel.find({ bootcamp: bootcampId })
        if(sessions.length === 0) return res.status(200).json({ 
            message: "No sessions were found"
        })

        const feedbacks = await FeedbackModel.find({ session: { $in: sessions } })
        if(feedbacks.length === 0) return res.status(200).json({ 
        message: "No feedbacks were found",
        feedbacks: []
        })

        res.status(200).json({ 
            message: "Feedbacks retrieved successfully",
            feedbacks
         })
    } catch(err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message
         })
    }
}

const getFeedbackPerSessionSchema = z.object({
    sessionId: z.string().min(1, "Session ID is required")
})
export const getFeedbackPerSession = async (req, res) => {
    const parseResult = getFeedbackPerSessionSchema.safeParse(req.params);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        return res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { sessionId } = parseResult.data
        const feedbacks = await FeedbackModel.find({ session: sessionId })

        if(feedbacks.length === 0) return res.status(200).json({ 
            message: "No feedbacks were found",
            feedbacks: []
        })
        
        res.status(200).json({ 
            message: "Feedbacks retrieved successfully",
            feedbacks
         })
    } catch(err) {
        res.status(500).json({ 
            error: "Validation Error",
            message: err.message
         })
    }
}

export const instructorFeedbackStats = async (req, res) => {
    const parseResult = getFeedbackPerBootcampSchema.safeParse(req.params);
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        return res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { bootcampId } = parseResult.data
        const sessions = await SessionModel.find({ bootcamp: bootcampId })
        if(sessions.length === 0) return res.status(200).json({
            message: "No sessions were found"
        })

        const feedbacks = await FeedbackModel.find({ session: { $in: sessions } })
        if(feedbacks.length === 0) return res.status(200).json({
            message: "No feedbacks were found",
            feedbacks: []
        })

        const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length

        res.status(200).json({
            message: "Feedback stats retrieved successfully",
            averageRating,
            totalFeedbacks: feedbacks.length
        })
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}