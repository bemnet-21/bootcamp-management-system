import express from 'express'
import { createTask, deleteTask, getAllSubmissionForTask, getAllTasks, getSubmissionStats, getTaskById, updateTask } from '../controllers/task.controller.js'
import protect from '../middlewares/auth.js'
import { requirePermission } from '../middlewares/requirePermission.js'

const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - deadline
 *               - submissionType
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               submissionType:
 *                 type: string
 *                 enum: [File, Link, Both]
 *               maxScore:
 *                 type: number
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', protect, requirePermission("tasks"), createTask)
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for a bootcamp
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       400:
 *         description: Validation error
 *       404:
 *         description: Bootcamp not found
 */
router.get('/', protect, requirePermission({ permission: "tasks", student: true }), getAllTasks)
/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task details
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or bootcamp not found
 */
router.get('/:taskId', protect, requirePermission({ permission: "tasks", student: true }), getTaskById)
/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               submissionType:
 *                 type: string
 *                 enum: [File, GitHub, Other]
 *               maxScore:
 *                 type: number
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or bootcamp not found
 */
router.put('/:taskId', protect, requirePermission("tasks"), updateTask)
/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or bootcamp not found
 */
router.delete('/:taskId', protect, requirePermission("tasks"), deleteTask)
/**
 * @swagger
 * /tasks/{taskId}/submissions:
 *   get:
 *     summary: Get all submissions for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: List of submissions
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or bootcamp not found
 */
router.get('/:taskId/submissions', protect, requirePermission("tasks"), getAllSubmissionForTask)
/**
 * @swagger
 * /tasks/{taskId}/stats:
 *   get:
 *     summary: Get submission stats for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Submission stats
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or bootcamp not found
 */
router.get('/:taskId/stats', protect, requirePermission("tasks"), getSubmissionStats)
export default router