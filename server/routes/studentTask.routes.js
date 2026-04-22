import express from 'express'
import { restrictTo } from '../middlewares/checkRole.js'
import { getAssignedTasks, getTaskDetail, submitTask } from '../controllers/studentTask.controller.js'
import upload from '../utils/multer.config.js'
import protect from '../middlewares/auth.js'

const router = express.Router({ mergeParams: true })

router.get('/', protect, restrictTo("Student"), getAssignedTasks)
router.get('/:taskId', protect, restrictTo("Student"), getTaskDetail)
router.post('/:taskId/submit', protect, restrictTo("Student"), upload.single('file'), submitTask)
export default router
