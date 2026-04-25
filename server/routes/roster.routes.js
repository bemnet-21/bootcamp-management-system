import express from "express";
import {
  addSingleStudent,
  addStudentsInBulk,
  listAllStudents,
  getSingleStudent,
  permanentlyRemoveStudent,
  updateStudentStatus,
  getStudentAttendance,
  getStudetSubmission,
} from "../controllers/roster.controller.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Roster
 *   description: Manage bootcamp student enrollment and roster operations
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students:
 *   post:
 *     summary: Add or re-enroll a student in a bootcamp
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: The bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student
 *             properties:
 *               student:
 *                 type: string
 *                 description: The student user ID
 *                 example: "64f123abc123"
 *     responses:
 *       201:
 *         description: Student successfully added to roster
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       200:
 *         description: Student re-enrolled successfully
 *       400:
 *         description: Invalid input or student already enrolled
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students/bulk:
 *   post:
 *     summary: Bulk add or re-enroll students in a bootcamp roster
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - students
 *             properties:
 *               students:
 *                 type: array
 *                 description: Array of student user IDs
 *                 items:
 *                   type: string
 *                 example:
 *                   - "64f1a2b3c4d5e6f7g8h9i0"
 *                   - "64f9b8c7d6e5f4a3b2c1d0"
 *
 *     responses:
 *       200:
 *         description: Bulk enrollment completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     matched:
 *                       type: number
 *                     modified:
 *                       type: number
 *                     upserted:
 *                       type: number
 *
 *       400:
 *         description: Validation error (empty or invalid students array)
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students:
 *   get:
 *     summary: List all active students in a bootcamp roster
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       bootcamp:
 *                         type: string
 *                       student:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       status:
 *                         type: string
 *                         example: active
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students/{studentId}:
 *   get:
 *     summary: Get a single student's enrollment in a bootcamp
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student (User) ID
 *
 *     responses:
 *       200:
 *         description: Student enrollment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bootcamp:
 *                       type: string
 *                     student:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     status:
 *                       type: string
 *                       example: active
 *                     joinedAt:
 *                       type: string
 *                       format: date-time
 *                     leftAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *
 *       404:
 *         description: Student not found in this bootcamp
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students/{studentId}/permanent:
 *   delete:
 *     summary: Permanently delete a student's enrollment from a bootcamp
 *     description: ⚠️ This will completely remove the enrollment record and cannot be recovered.
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student (User) ID
 *
 *     responses:
 *       200:
 *         description: Enrollment permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *
 *       404:
 *         description: Enrollment not found
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bootcamps/{bootcampId}/students/{studentId}:
 *   patch:
 *     summary: Update a student's enrollment status in a bootcamp
 *     description: Changes the enrollment state (active, dropped, completed)
 *     tags: [Roster]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student (User) ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, dropped, completed]
 *                 example: dropped
 *
 *     responses:
 *       200:
 *         description: Enrollment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *
 *       400:
 *         description: Invalid status value
 *
 *       404:
 *         description: Enrollment not found
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

router.post("/", addSingleStudent);
router.post("/bulk", addStudentsInBulk);
router.get("/", listAllStudents);
router.get("/:studentId", getSingleStudent);
router.delete("/:studentId", permanentlyRemoveStudent);
router.patch("/:studentId", updateStudentStatus);

// NOT IMPLEMENTED
router.get("/:studentId/attendance", getStudentAttendance);
router.get("/:studentId/submissions", getStudetSubmission);
export default router;
