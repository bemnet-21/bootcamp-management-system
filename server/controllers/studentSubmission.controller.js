import z from "zod";
import SubmissionModel from "../models/Submission.model.js";

const updateSubmissionSchema = z.object({
    githubLink: z.string().url("Invalid GitHub URL").optional(),
    submissionId: z.string().min(1, "Submission ID is required")
})
export const updateSubmission = async (req, res) => {
    const studentId = req.user.id

    const parseResult = updateSubmissionSchema.safeParse({ 
        submissionId: req.params.submissionId,
        githubLink: req.body.githubLink
    });

    if (!parseResult.success) {
        return res.status(400).json({
            error: "Validation Error",
            message: parseResult.error.errors.map(e => e.message).join(", ")
         });
    }

    try {
        const { submissionId, githubLink } = parseResult.data;

        const submission = await SubmissionModel.findById(submissionId).populate("task");
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        if (submission.student.toString() !== studentId.toString()) {
            return res.status(403).json({ error: "Forbidden", message: "You can only update your own work" });
        }

        if (submission.status === "Graded") {
            return res.status(400).json({
                error: "Bad Request",
                message: "Cannot update a graded submission. Please contact your instructor."
             });
        }

        const fileUrl = req.file ? (req.file.path || req.file.secure_url) : undefined;
        const { submissionType } = submission.task;
        
        const hasFile = fileUrl || submission.fileUrl;
        const hasLink = githubLink || submission.githubLink;

        if (submissionType === "File" && !hasFile) {
            return res.status(400).json({ error: "Validation Error", message: "File is required" });
        }
        if (submissionType === "GitHub" && !hasLink) {
            return res.status(400).json({ error: "Validation Error", message: "GitHub link is required" });
        }

        submission.githubLink = githubLink || submission.githubLink;
        if (fileUrl) submission.fileUrl = fileUrl;

        submission.status = "Pending";
        submission.version += 1;

        await submission.save();

        return res.status(200).json({
            message: `Resubmission (v${submission.version}) successful`,
            submission
        });

    } catch(err) {
        return res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
}

export const getPersonalSubmissions = async (req, res) => {
    const studentId = req.user.id
    try {
        const submissions = await SubmissionModel.find({ student: studentId })
                                                 .populate("task", "title submissionType")
                                                 .sort({ createdAt: -1 })
                                                 .lean();

        if(submissions.length === 0) {
            return res.status(200).json({
                message: "No submissions found",
                submissions: []
            });
        }

        return res.status(200).json({
            message: "Personal submissions retrieved successfully",
            submissions
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
}

const getSubmissionGradeSchema = z.object({
    submissionId: z.string().min(1, "Submission ID is required")
})
export const getSubmissionGrade = async (req, res) => {
    const studentId = req.user.id
    const parseResult = getSubmissionGradeSchema.safeParse({ submissionId: req.params.submissionId });
    if (!parseResult.success) {
        return res.status(400).json({
            error: "Validation Error",
            message: parseResult.error.errors.map(e => e.message).join(", ")
         });
    }   
    try {
        const { submissionId } = parseResult.data;
        const submission = await SubmissionModel.findById(submissionId).populate("task", "title submissionType");
        if (!submission) return res.status(404).json({ message: "Submission not found" });
        if (submission.student.toString() !== studentId.toString()) {
            return res.status(403).json({ error: "Forbidden", message: "You can only view your own grades" });
        }

        if (submission.status !== "Graded") {
            submission.score = null;
            submission.instructorFeedback = "Not graded yet";
        }   
        res.status(200).json({
            message: "Submission grade retrieved successfully",
            submission: {
                id: submission._id,
                task: submission.task,
                score: submission.score,
                feedback: submission.instructorFeedback
            }
        });
    } catch(err) {
        return res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
}