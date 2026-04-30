import z from "zod"
import SessionModel from "../models/Session.model.js";
import FeedbackModel from "../models/Feedback.model.js";
import BootcampModel from "../models/Bootcamp.model.js";
import BootcampHelper from "../models/BootcampHelper.model.js";

// Get all feedback for a session (instructor only)
export const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get session and populate bootcamp
    const session = await SessionModel.findById(sessionId).populate('bootcamp');

    if (!session) {
      return res.status(404).json({
        error: "Not Found",
        message: "Session not found"
      });
    }

    // Check if user is lead instructor
    const bootcamp = await BootcampModel.findById(session.bootcamp);
    const isLeadInstructor = bootcamp.leadInstructor.toString() === userId;

    // Check if user is helper with analytics permission
    let isAuthorizedHelper = false;
    if (!isLeadInstructor) {
      const helper = await BootcampHelper.findOne({
        bootcamp: session.bootcamp,
        user: userId
      });
      isAuthorizedHelper = helper && helper.permissions?.analytics === true;
    }

    if (!isLeadInstructor && !isAuthorizedHelper) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view feedback for this session"
      });
    }

    // Get all feedback for this session
    const feedbacks = await FeedbackModel.find({ session: sessionId })
      .populate('student', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const total = feedbacks.length;
    const averageRating = total > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total
      : 0;

    const ratingDistribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        feedbacks,
        stats: {
          total,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      }
    });
  } catch (err) {
    console.error("Error getting session feedback:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
};

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