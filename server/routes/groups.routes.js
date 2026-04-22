import express from "express";
import {
  createGroup,
  addGroupMembers,
  removeStudent,
  getMyGroup,
  deleteGroup,
  getAllGroups,
} from "../controllers/groups.controller.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group management
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}:
 *   post:
 *     summary: Create a new Group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alpha Team
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/{groupId}/members:
 *   post:
 *     summary: Add members to a group
 *     tags: [Group]
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
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to group
 *     responses:
 *       200:
 *         description: Members added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/{groupId}/members/{studentId}:
 *   delete:
 *     summary: Remove a student from a group
 *     tags: [Group]
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
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student (User) ID to remove
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/me:
 *   get:
 *     summary: Get logged-in user's group in a bootcamp
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bootcampId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bootcamp ID
 *     responses:
 *       200:
 *         description: User group fetched successfully
 *       404:
 *         description: User is not assigned to any group
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/{groupId}:
 *   delete:
 *     summary: Delete a group and all its members
 *     tags: [Group]
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
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group and members deleted successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

// protect  for authenticated users only
router.use(protect);

// create group
router.post("/:bootcampId", createGroup);

// delete group
router.delete("/:bootcampId/:groupId", deleteGroup);

// list groups in the bootcamp
router.get("/:bootcampId" , getAllGroups);

// add bulk or single students
router.post("/:bootcampId/:groupId/members", addGroupMembers);

// remove single student
router.delete("/:bootcampId/:groupId/members/:studentId", removeStudent);

// view students group
router.get("/:bootcampId/me", getMyGroup);


export default router;
