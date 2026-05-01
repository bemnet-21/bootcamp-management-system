import express from "express";
import {
  createGroup,
  addGroupMembers,
  removeStudent,
  getMyGroup,
  deleteGroup,
  getAllGroups,
  getGroupDetails,
  updateGroup,
  getAvailableStudents,
} from "../controllers/groups.controller.js";
import protect from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/requirePermission.js";
import { checkLead } from "../middlewares/checkLead.js";
import { checkStudent } from "../middlewares/checkStudents.js";

const router = express.Router({mergeParams:true});

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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alpha Team
 *               description:
 *                 type: string
 *                 example: Example description
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

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/:
 *   get:
 *     summary: Get all groups in a bootcamp
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
 *         description: Groups fetched successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/{groupId}:
 *   get:
 *     summary: Get group details with members
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
 *         description: Group details fetched successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /bootcamps/groups/{bootcampId}/{groupId}:
 *   put:
 *     summary: Update a group
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
 *             properties:
 *               name:
 *                 type: string
 *               mentor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

router.use(protect); //auth user only

// Get my group
router.get("/me", checkStudent, getMyGroup);

// Get available students (not in any group)
router.get("/available-students", requirePermission("groups"), getAvailableStudents);

// Create group
router.post("/", requirePermission("groups"), createGroup);

// List groups in a bootcamp
router.get("/", requirePermission({ permission: "groups", student: true }), getAllGroups);

// Get single group (with members)
router.get("/:groupId", requirePermission({ permission: "groups", student: true }), getGroupDetails);

// Update group
router.put("/:groupId", requirePermission("groups"), updateGroup);

// Delete group
router.delete("/:groupId", checkLead, deleteGroup);

// Add members bulk/single
router.post("/:groupId/members", requirePermission("groups"), addGroupMembers);

// Remove single member
router.delete(
  "/:groupId/members/:studentId",
  requirePermission("groups"),
  removeStudent,
);

export default router;
