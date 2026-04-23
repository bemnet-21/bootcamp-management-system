import z from "zod"
import SubmissionModel from "../models/Submission.model.js"

export const pendingSubmissions = async (req, res) => {
    try {
        const pendings = await SubmissionModel.find({ status: "Pending" })
                                            .populate("task")
                                            .populate("student", "firstName lastName email")
        if(pendings.length === 0) return res.status(200).json({ 
            message: "No pending submissions found.",
            pendings: []
         })

         res.status(200).json({
            message: "Pending submissions retrieved successfully.",
            pendings
         })

    } catch(err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message
         })
    }
}

const getStudentSubmissionSchema = z.object({
    submissionId: z.string().min(1, "Submission ID is required")
})
export const getStudentSubmission = async (req, res) => {
    const parseResult = getStudentSubmissionSchema.safeParse(req.params)
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        return res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { submissionId } = parseResult.data
        const submission = await SubmissionModel.findById(submissionId)
                                            .populate("task")
                                            .populate("student", "firstName lastName email")

        if(!submission) {
            return res.status(404).json({
                error: "Not Found",
                message: "Submission not found."
            })
        }

        res.status(200).json({
            message: "Submission retrieved successfully.",
            submission
        })
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}

const gradeSchema = z.object({
    submissionId: z.string().min(1, "Submission ID is required"),
    score: z.number().min(0, "Score must be at least 0").max(100, "Score cannot exceed 100"),
    instructorFeedback: z.string()
})
export const gradeSubmission = async (req, res) => {
    const parseResult = gradeSchema.safeParse({
        submissionId: req.params.submissionId,
        score: req.body.score,
        instructorFeedback: req.body.instructorFeedback
    })
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { submissionId, score, instructorFeedback } = parseResult.data
        const submission = await SubmissionModel.findById(submissionId)
        if(!submission) {
            return res.status(404).json({
                error: "Not Found",
                message: "Submission not found."
            })
        }

        submission.score = score
        submission.instructorFeedback = instructorFeedback
        submission.status = "Graded"
        await submission.save()

        res.status(200).json({
            message: "Submission graded successfully.",
            submission
        })
    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}

const returnSubmissionSchema = z.object({
    instructorFeedback: z.string().min(1, "Instructor feedback is required"),
    submissionId: z.string().min(1, "Submission ID is required")
})
export const returnForReSubmission = async (req, res) => {
    const parseResult = returnSubmissionSchema.safeParse({
        instructorFeedback: req.body.instructorFeedback,
        submissionId: req.params.submissionId
    })
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ")
        res.status(400).json({
            error: "Validation Error",
            message: errors
        })
    }

    try {
        const { submissionId, instructorFeedback } = parseResult.data

        const submission = await SubmissionModel.findById(submissionId)
        if(!submission) {
            return res.status(404).json({
                error: "Not Found",
                message: "Submission not found."
            })
        }

        submission.instructorFeedback = instructorFeedback
        submission.status = "Returned"

        await submission.save()

        res.status(200).json({ 
            message: "Returned for resubmission successfully"
         })

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}