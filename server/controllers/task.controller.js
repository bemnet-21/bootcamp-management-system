import z from "zod"
import TaskModel from "../models/Task.model.js"
import BootcampModel from "../models/Bootcamp.model.js"
import { parse } from "dotenv"
import SubmissionModel from "../models/Submission.model.js"

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    bootcampId: z.string().min(1, "Bootcamp ID is required"),
    deadline: z.string().refine(dateStr => !isNaN(Date.parse(dateStr)), {
        message: "Invalid date format"
    }),
    submissionType: z.enum(["File", "Link", "Both"], {
        errorMap: () => ({ message: "Submission type must be one of: File, Link, Both" })
    }),
    maxScore: z.number().optional()
})
export const createTask = async (req, res) => {
    const parseResult = createTaskSchema.safeParse({
        title: req.body.title,
        description: req.body.description,
        bootcampId: req.params.bootcampId,
        deadline: req.body.deadline,
        submissionType: req.body.submissionType,
        maxScore: req.body.maxScore
    })
    if(!parseResult.success) {
        const errors = parseResult.error?.errors?.map(err => err.message) || ['Validation failed']
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { title, description, bootcampId, deadline, submissionType, maxScore } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })

        const newTask = await TaskModel.create({
            title,
            description,
            bootcamp,
            instructor: bootcamp.leadInstructor,
            deadline: new Date(deadline),
            submissionType,
            maxScore
        })

        res.status(201).json({
            message: "Task created successfully",
            task: newTask
        })

    } catch(err) {
        res.status(500).json({
            error: "Server Error",
            message: err.message
        })
    }
}

const getTasksSchema = z.object({
    bootcampId: z.string().min(1, "Bootcamp ID is required")
})
export const getAllTasks = async (req, res) => {
    const parseResult = getTasksSchema.safeParse({
        bootcampId: req.params.bootcampId
    })
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { bootcampId } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })


        const tasks = await TaskModel.find({ bootcamp: bootcampId }).populate("instructor", "firstName lastName email")

        res.status(200).json({
            message: tasks.length === 0 ? "No tasks found for this bootcamp" : "Tasks retrieved successfully",
            tasks
        })

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}

const getTaskByIdSchema = z.object({
    bootcampId: z.string().min(1, "Bootcamp ID is required"),
    taskId: z.string().min(1, "Task ID is required")
})
export const getTaskById = async (req, res) => {
    const parseResult = getTaskByIdSchema.safeParse({
        bootcampId: req.params.bootcampId,
        taskId: req.params.taskId
    })
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { bootcampId, taskId } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })

        const task = await TaskModel.findOne({bootcamp: bootcampId, _id: taskId}).populate("instructor", "firstName lastName email")
        if(!task) return res.status(404).json({ error: "Task not found" })

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

const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    maxScore: z.number().optional(),
    deadline: z.string().refine(dateStr => !isNaN(Date.parse(dateStr)), {
        message: "Invalid date format"
     }).optional(),
    submissionType: z.enum(["File", "Link", "Both"], {
        errorMap: () => ({ message: "Submission type must be one of: File, Link, Both" })
    }).optional(),
    bootcampId: z.string().min(1, "Bootcamp ID is required"),
    taskId: z.string().min(1, "Task ID is required")
})
export const updateTask = async (req, res) => {
    const parseResult = updateTaskSchema.safeParse({
        title: req.body.title,
        description: req.body.description,
        maxScore: req.body.maxScore,
        deadline: req.body.deadline,
        submissionType: req.body.submissionType,
        bootcampId: req.params.bootcampId,
        taskId: req.params.taskId
    })

    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        return res.status(400).json({ 
            error: "Validation Error",
            message: errors.join(", ")
        })
    }
    try {
        const { title, description, maxScore, deadline, submissionType, taskId, bootcampId } = parseResult.data

        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })

        const task = await TaskModel.findById(taskId)
        if(!task) return res.status(404).json({ error: "Task not found" })

        if(title) task.title = title
        if(description) task.description = description
        if(maxScore !== undefined) task.maxScore = maxScore
        if(deadline) task.deadline = new Date(deadline)
        if(submissionType) task.submissionType = submissionType

        await task.save()

        res.status(200).json({
            message: "Task updated successfully",
            task
        })
        
    } catch(err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message
         })
    }

}

export const deleteTask = async (req, res) => {
    const parseResult = getTaskByIdSchema.safeParse({
        bootcampId: req.params.bootcampId,
        taskId: req.params.taskId
    })

    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { bootcampId, taskId } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })
        
        const task = await TaskModel.findByIdAndDelete(taskId)
        if(!task) return res.status(404).json({ error: "Task not found" })
        res.json({ message: "Task deleted successfully" })

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}

export const getAllSubmissionForTask = async (req, res) => {
    const parseResult = getTaskByIdSchema.safeParse(req.params)
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { bootcampId, taskId } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })

        const submission = await SubmissionModel.find({ task: taskId })
        if(submission.length === 0) return res.status(200).json({ message: "No submissions were found" })

        res.status(200).json({
            message: "Submissions found",
            submission
        })

    } catch(err) {
        res.status(500).json({ 
            error: "Internal Server Error",
            message: err.message
         })
    }
}

export const getSubmissionStats = async (req, res) => {
    const parseResult = getTaskByIdSchema.safeParse(req.params)
    if(!parseResult.success) {
        const errors = parseResult.error.errors.map(err => err.message)
        return res.status(400).json({
            error: "Validation Error",
            message: errors.join(", ")
        })
    }

    try {
        const { bootcampId, taskId } = parseResult.data
        const bootcamp = await BootcampModel.findById(bootcampId)
        if(!bootcamp) return res.status(404).json({ error: "Bootcamp not found" })

        const totalSubmissions = await SubmissionModel.countDocuments({ task: taskId })
        const gradedSubmissions = await SubmissionModel.countDocuments({ task: taskId, status: "Graded" })
        const pendingSubmissions = await SubmissionModel.countDocuments({ task: taskId, status: "Pending" })
        const returnedSubmissions = await SubmissionModel.countDocuments({ task: taskId, status: "Returned" })

        res.status(200).json({
            message: "Submission stats retrieved successfully",
            stats: {
                total: totalSubmissions,
                graded: gradedSubmissions,
                pending: pendingSubmissions,
                returned: returnedSubmissions
            }
        })

    } catch(err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        })
    }
}
