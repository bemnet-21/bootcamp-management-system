import SessionModel from "../models/Session.model.js";
import FeedbackModel from "../models/Feedback.model.js";
import AttendanceModel from "../models/Attendance.model.js";
import z from "zod";

export const getFeedbackAwaitingSessions = async (req, res) => {
  try {
    const studentId = req.user.id; 
    const attendedSessions = await AttendanceModel.find({ student: studentId });

    const feedbacks = await FeedbackModel.find({ student: studentId });
    const feedbackSessionIds = feedbacks.map(fb => fb.session.toString());

    const awaitingFeedbackSessions = attendedSessions.filter(
      attendance => !feedbackSessionIds.includes(attendance.session.toString())
    );

    res.status(200).json({
      message: "Sessions awaiting feedback retrieved successfully.",
      sessions: awaitingFeedbackSessions
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
};

const submitFeedbackSchema = z.object({
    sessionId: z.string().nonempty(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
})
export const submitSessionFeedback = async (req, res) => {
    const parseResult = submitFeedbackSchema.safeParse({
        sessionId: req.params.sessionId,
        rating: req.body.rating,
        comment: req.body.comment
    });

    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        });
    }

    try {
        const { sessionId, rating, comment } = parseResult.data;
        const studentId = req.user.id;

        const session = await SessionModel.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: "Not Found",
                message: "Session not found"
            });
        }

        const hasAttended = await AttendanceModel.exists({ session: sessionId, student: studentId, status: { $in: ["Present", "Late"] } });
        if (!hasAttended) {
            return res.status(400).json({
                error: "Bad Request",
                message: "You can only submit feedback for sessions you have attended"
            });
        }

        const existingFeedback = await FeedbackModel.findOne({ session: sessionId, student: studentId });
        if (existingFeedback) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Feedback for this session has already been submitted"
            });
        }
        const feedback = await FeedbackModel.create({
            session: sessionId,
            student: studentId,
            rating,
            comment
        });
        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
}

const getOwnFeedbackSubmissionsSchema = z.object({
    sessionId: z.string().nonempty()
})
export const getOwnFeedbackSubmissions = async (req, res) => {
    const parseResult = getOwnFeedbackSubmissionsSchema.safeParse({
        sessionId: req.params.sessionId
    })
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { sessionId } = parseResult.data
        const studentId = req.user.id
        const feedbacks = await FeedbackModel.find({ session: sessionId, student: studentId })
        res.status(200).json({
            message: "Feedback submissions retrieved successfully.",
            feedbacks
        })
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}

const updateSessionFeedbackSchema = z.object({
    sessionId: z.string().nonempty(),
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional()
})
export const updateSessionFeedback = async (req, res) => {
    const parseResult = updateSessionFeedbackSchema.safeParse({
        sessionId: req.params.sessionId,
        rating: req.body.rating,
        comment: req.body.comment
    });

    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { sessionId, rating, comment } = parseResult.data
        const studentId = req.user.id
        const feedback = await FeedbackModel.findOne({ session: sessionId, student: studentId })
        if(!feedback) {
            return res.status(404).json({
                error: "Not Found",
                message: "Feedback not found for this session"
            })
        }

        if(feedback.createdAt && (new Date() - feedback.createdAt) > 48 * 60 * 60 * 1000) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Feedback can only be updated within 48 hours of submission"
            })
        }

        if(rating) feedback.rating = rating
        if(comment) feedback.comment = comment
        await feedback.save()
        res.status(200).json({
            message: "Feedback updated successfully",
            feedback
        })
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}