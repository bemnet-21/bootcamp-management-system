import { z } from "zod";
import userModel from "../models/User.model.js";
import GroupModel from "../models/Group.model.js";
import GroupMemberModel from "../models/groupMember.model.js";
import UserModel from "../models/User.model.js";
import { error } from "node:console";
import BootcampModel from "../models/Bootcamp.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";
const createGroupSchema = z.object({
  name: z.string().min(2, "group name is required").trim(),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
});

const addGroupMembersSchema = z.object({
  members: z.array(z.string()).min(1, "members are required"),
});

const updateGroupSchema = z.object({
  name: z.string().min(2, "group name is required").trim().optional(),
  description: z.string().optional(),
});
export const createGroup = async (req, res) => {
  console.log("its inside create group");

  try {
    const validatedData = createGroupSchema.parse(req.body);
    const { bootcampId } = req.params;

    validatedData.bootcamp = bootcampId;

    //  Create Group
    const group = await GroupModel.create({
      name: validatedData.name,
      bootcamp: bootcampId,
      description: validatedData.description,
    });

    // Add members if provided
    if (validatedData.members && validatedData.members.length > 0) {
      // Verify all members are enrolled in the bootcamp
      const enrollments = await EnrollmentModel.find({
        bootcamp: bootcampId,
        student: { $in: validatedData.members },
      });

      const enrolledIds = enrollments.map((e) => e.student.toString());
      const notEnrolled = validatedData.members.filter(
        (id) => !enrolledIds.includes(id.toString()),
      );

      if (notEnrolled.length > 0) {
        // Delete the group if members can't be added
        await GroupModel.findByIdAndDelete(group._id);
        return res.status(403).json({
          error: "Enrollment Error",
          message: "Some users are not part of the bootcamp",
        });
      }

      // Check if any members already belong to another group
      const existing = await GroupMemberModel.find({
        bootcamp: bootcampId,
        user: { $in: validatedData.members },
      });

      if (existing.length > 0) {
        // Delete the group if members are already in another group
        await GroupModel.findByIdAndDelete(group._id);
        return res.status(400).json({
          error: "Validation Error",
          message: "Some users already belong to a group in this bootcamp",
        });
      }

      // Add all members to the group
      const memberDocs = validatedData.members.map((userId) => ({
        group: group._id,
        user: userId,
        bootcamp: bootcampId,
      }));

      await GroupMemberModel.insertMany(memberDocs);
    }

    return res.status(201).json({
      success: true,
      data: group,
      message: "Group created successfully",
    });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.issues[0].message,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const addGroupMembers = async (req, res) => {
  try {
    const { bootcampId, groupId } = req.params;
    const userId = req.user.id;

    const validatedData = addGroupMembersSchema.parse(req.body);

    // check bootcamp membership

    const enrollments = await EnrollmentModel.find({
      bootcamp: bootcampId,
      student: { $in: validatedData.members },
    });
    const enrolledIds = enrollments.map((e) => e.student.toString());
    const notEnrolled = validatedData.members.filter(
      (id) => !enrolledIds.includes(id.toString()),
    );
    if (notEnrolled.length > 0) {
      return res.status(403).json({
        error: "enrolment",
        message: "Some users are not part of the bootcamp",
      });
    }

    if (!enrollments) {
      return res.status(403).json({
        error: "enrolment",
        message: "you are not part of the bootcamp",
      });
    }
    // prevent duplicate
    const existing = await GroupMemberModel.find({
      bootcamp: bootcampId,
      user: { $in: validatedData.members },
    });

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Some users already belong to a group in this bootcamp",
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Some users are already in this group",
      });
    }

    // check group exist
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    // validate user exist
    const users = await UserModel.find({
      _id: { $in: validatedData.members },
    });

    if (users.length !== validatedData.members.length) {
      return res.status(400).json({
        error: "Validation Error",
        message: "One or more user IDs are invalid",
      });
    }

    // construct and add
    const membersToInsert = validatedData.members.map((userId) => ({
      group: groupId,
      bootcamp: bootcampId,
      user: userId,
      mentors: [],
    }));

    await GroupMemberModel.insertMany(membersToInsert);

    return res.status(201).json({
      success: true,
      message: "Members added successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.issues[0].message,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const removeStudent = async (req, res) => {
  const { bootcampId, groupId, studentId } = req.params;
  try {
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    const groupMember = await GroupMemberModel.findOne({
      group: groupId,
      bootcamp: bootcampId,
      user: studentId,
    });

    if (!groupMember) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found in this group",
      });
    }

    await GroupMemberModel.deleteOne({
      group: groupId,
      bootcamp: bootcampId,
      user: studentId,
    });

    return res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getMyGroup = async (req, res) => {
  const { bootcampId } = req.params;
  const userId = req.user.id;

  try {
    const membership = await GroupMemberModel.findOne({
      bootcamp: bootcampId,
      user: userId,
    }).populate("group");

    if (!membership) {
      return res.status(404).json({
        error: "Not Found",
        message: "You are not assigned to any group in this bootcamp",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        group: membership.group,
        bootcamp: bootcampId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const deleteGroup = async (req, res) => {
  const { bootcampId, groupId } = req.params;

  try {
    // check group exist
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    // delete members then group
    await GroupMemberModel.deleteMany({
      group: groupId,
      bootcamp: bootcampId,
    });

    await GroupModel.deleteOne({ _id: groupId });

    return res.status(200).json({
      success: true,
      message: "Group and its members deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getAllGroups = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    const groups = await GroupModel.find({ bootcamp: bootcampId });

    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// get group detail with members

export const getGroupDetails = async (req, res) => {
  const { bootcampId, groupId } = req.params;

  try {
    // check group exist
    const group = await GroupModel.findOne({
      _id: groupId,
      bootcamp: bootcampId,
    });

    if (!group) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    // fetch members
    const members = await GroupMemberModel.find({
      group: groupId,
      bootcamp: bootcampId,
    }).populate("user", "name email role firstName");

    return res.status(200).json({
      success: true,
      data: {
        group,
        members,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const updateGroup = async (req, res) => {
  const { bootcampId, groupId } = req.params;

  try {
    // check group exist and update

    const validatedData = updateGroupSchema.parse(req.body);

    if (validatedData.members) {
      const enrollments = await EnrollmentModel.find({
        bootcamp: bootcampId,
        student: { $in: validatedData.members },
      });

      const enrolledIds = enrollments.map((e) => e.student.toString());

      const notEnrolled = validatedData.members.filter(
        (id) => !enrolledIds.includes(id.toString()),
      );

      if (notEnrolled.length > 0) {
        return res.status(403).json({
          error: "enrolment",
          message: "Some users are not part of the bootcamp",
        });
      }
    }

    const updatedGroup = await GroupModel.findOneAndUpdate(
      {
        _id: groupId,
        bootcamp: bootcampId,
      },
      validatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedGroup) {
      return res.status(404).json({
        error: "Not Found",
        message: "Group not found in this bootcamp",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGroup,
      message: "Group updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getAvailableStudents = async (req, res) => {
  const { bootcampId } = req.params;

  try {
    // Get all enrolled students in this bootcamp
    const enrollments = await EnrollmentModel.find({
      bootcamp: bootcampId,
      status: 'active'
    }).populate("student", "firstName lastName email");

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No enrolled students found",
      });
    }

    // Get all students who are already in groups in this bootcamp
    const studentsInGroups = await GroupMemberModel.find({
      bootcamp: bootcampId,
    }).distinct("user");

    // Convert to Set for faster lookup
    const studentsInGroupsSet = new Set(
      studentsInGroups.map((id) => id.toString())
    );

    // Filter out students who are already in groups and extract student objects
    const availableStudents = enrollments
      .filter(
        (enrollment) =>
          enrollment.student != null &&
          !studentsInGroupsSet.has(enrollment.student._id.toString())
      )
      .map((enrollment) => enrollment.student);

    return res.status(200).json({
      success: true,
      data: availableStudents,
      message: "Available students fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
