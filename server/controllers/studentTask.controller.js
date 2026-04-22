import z from "zod"
import BootcampModel from "../models/Bootcamp.model.js"
import TaskModel from "../models/Task.model.js"
import SubmissionModel from "../models/Submission.model.js"

export const getAssignedTasks = async (req, res) => {
    try {
        const bootcamps = await BootcampModel.find({ students: req.user.id }).select("_id")
        if(bootcamps.length === 0) return res.json({ message:"Not registered in any bootcamp" })
        const bootcampIds = bootcamps.map(bootcamp => bootcamp._id)

        const tasks = await TaskModel.find({ bootcamp: { $in: bootcampIds } })
                                     .populate("bootcamp", "name")
                                     .populate("instructor", "firstName lastName email")
                                     .sort({ deadline: -1 })
                                     .lean()
        if(tasks.length === 0) return res.status(200).json({ 
            message: "No tasks assigned",
            tasks: []
         })

         res.status(200).json({
            message: "Assigned tasks retrieved successfully",
            tasks
         })

    } catch(err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message
         })
    }
}

const getTaskDetailSchema = z.object({
    taskId: z.string().min(1, "Task ID is required")
})
export const getTaskDetail = async (req, res) => {
    const parseResult = getTaskDetailSchema.safeParse(req.params)
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message)
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }
    
    try {
        const { taskId } = parseResult.data
        const bootcamps = await BootcampModel.find({ students: req.user.id }).select("_id")
        if(bootcamps.length === 0) return res.json({ message: "Not registered to any bootcamp" })
        const bootcampIds = bootcamps.map(bootcamp => bootcamp._id)

        const task = await TaskModel.find({ bootcamp: { $in: bootcampIds }, _id: taskId })
                                    .populate("bootcamp", "name")
                                    .populate("instructor", "firstName lastName email")

        if(!task) return res.status(404).json({
            error: "Not Found",
            message: "Task not found or not assigned to you"
        })

        res.status(200).json({ 
            message: "Task retrieved successfully",
            task
         })

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}



const submitTaskSchema = z.object({
    githubLink: z.string().url().optional(),
    taskId: z.string().min(1, "Task ID is required")
})

export const submitTask = async (req, res) => {
    const studentId = req.user.id;

    const parseResult = submitTaskSchema.safeParse({ ...req.body, taskId: req.params.taskId });
    if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message);
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        });
    }
    const { taskId, githubLink } = parseResult.data;
    try {
        const prevSubmission = await SubmissionModel.findOne({ task: taskId, student: studentId }).sort({ version: -1 });
        if(prevSubmission) return res.status(409).json({
            error: "Submission Conflict",
            message: "You have already submitted this task. Please update your existing submission if you want to make changes."
        })

        const task = await TaskModel.findById(taskId).populate("bootcamp");
        if (!task) return res.status(404).json({ error: "Not Found", message: "Task not found" });

        const bootcamp = await BootcampModel.findOne({ _id: task.bootcamp._id, students: studentId });
        if (!bootcamp) return res.status(403).json({ error: "Forbidden", message: "You are not registered in this bootcamp" });

        const { submissionType } = task;
        const fileUrl = req.file ? (req.file.path || req.file.url) : undefined;

        if (submissionType === "File" && !fileUrl) {
            return res.status(400).json({ error: "Validation Error", message: "File is required for this task" });
        }
        if (submissionType === "GitHub" && !githubLink) {
            return res.status(400).json({ error: "Validation Error", message: "GitHub link is required for this task" });
        }
        if (submissionType === "Both" && !fileUrl && !githubLink) {
            return res.status(400).json({ error: "Validation Error", message: "Either file or GitHub link is required for this task" });
        }

        

        const submission = await SubmissionModel.create({
            task: taskId,
            student: studentId,
            fileUrl,
            githubLink,
            version: 1,
        });

        return res.status(201).json({
            message: "Task submitted successfully",
            submission,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
}
