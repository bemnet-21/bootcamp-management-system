import express from 'express'
import { getPersonalSubmissions, updateSubmission } from '../controllers/studentSubmission.controller.js'
import protect from '../middlewares/auth.js'
import { restrictTo } from '../middlewares/checkRole.js'
import upload from '../utils/multer.config.js'

const router = express.Router({ mergeParams: true })
router.get('/', protect, restrictTo("Student"), getPersonalSubmissions)
router.put('/:submissionId', protect, restrictTo("Student"), upload.single('file'), updateSubmission)

export default router