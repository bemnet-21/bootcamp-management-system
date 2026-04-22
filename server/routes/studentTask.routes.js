import express from 'express'
import { restrictTo } from '../middlewares/checkRole.js'
import { getAssignedTasks, getTaskDetail, submitTask } from '../controllers/studentTask.controller.js'
import upload from '../utils/multer.config.js'
import protect from '../middlewares/auth.js'

const router = express.Router({ mergeParams: true })

/**
 * @swagger
 * /studentTasks:
 *   get:
 *     summary: Get all tasks assigned to the authenticated student
 *     tags: [StudentTasks]
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
 * /studentTasks/{taskId}:
 *   get:
 *     summary: Get details for a specific assigned task
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
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
 * /studentTasks/{taskId}/submit:
 *   post:
 *     summary: Submit a file for a specific task
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
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
 */
router.post('/:taskId/submit', protect, restrictTo("Student"), upload.single('file'), submitTask)
export default router
