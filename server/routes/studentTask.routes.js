import express from 'express'
import { restrictTo } from '../middlewares/checkRole.js'
import { getAssignedTasks, getTaskDetail, submitTask } from '../controllers/studentTask.controller.js'
import upload from '../utils/multer.config.js'
import protect from '../middlewares/auth.js'

const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /student/tasks:
 *   get:
 *     summary: Get all assigned tasks for the authenticated student
 *     tags: [Student Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, restrictTo("Student"), getAssignedTasks)
/**
 * @swagger
 * /student/tasks/{taskId}:
 *   get:
 *     summary: Get details of a specific task assigned to the student
 *     tags: [Student Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get('/:taskId', protect, restrictTo("Student"), getTaskDetail)
/**
 * @swagger
 * /student/tasks/{taskId}/submit:
 *   post:
 *     summary: Submit a task as a student
 *     tags: [Student Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Task submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.post('/:taskId/submit', protect, restrictTo("Student"), upload.single('file'), submitTask)
export default router
