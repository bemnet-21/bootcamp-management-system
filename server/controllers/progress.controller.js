import z from "zod";
import GroupModel from "../models/Group.model.js";
import GroupMemberModel from "../models/groupMember.model.js";
import GroupProgressModel from "../models/GroupProgress.model.js";

const createProgressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Link must be a valid URL"),
});

const updateProgressSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  link: z.string().url("Link must be a valid URL").optional(),
});
export const createProgress = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const data = createProgressSchema.parse(req.body);

    //validate group exist
    const group = await GroupModel.findById(groupId).populate("bootcamp");

    if (!group || !group.bootcamp || group.bootcamp.isDeleted) {
      return res.status(404).json({
        message: "Group or bootcamp not found",
      });
    }

    // membership check
    const isMember = await GroupMemberModel.findOne({
      group: groupId,
      user: userId,
    });

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    // week calculate
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    const elapsed = Date.now() - group.createdAt.getTime();

    const weekNumber = Math.max(1, Math.floor(elapsed / msPerWeek) + 1);

    // create progress
    const progress = await GroupProgressModel.create({
      ...data,
      group: groupId,
      bootcamp: group.bootcamp._id,
      submittedBy: userId,
      weekNumber,
    });

    return res.status(201).json({
      message: "Progress created successfully",
      progress,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Progress already submitted for this week",
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProgressDetail = async (req, res) => {
  const { progressId, groupId } = req.params;
  const userId = req.user.id;

  try {
    const data = updateProgressSchema.parse(req.body);

    const progress = await GroupProgressModel.findById(progressId);

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    // ensure progress belongs to the group
    if (progress.group.toString() !== groupId) {
      return res.status(400).json({
        message: "Progress does not belong to this group",
      });
    }

    // ownership check
    if (progress.submittedBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only the creator can update the progress",
      });
    }

    const updated = await GroupProgressModel.findByIdAndUpdate(
      progressId,
      { $set: data },
      { new: true },
    );
    console.log(updated);

    return res.status(200).json({
      message: "Progress updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProgressDetail = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    // validate group
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const progressData = await GroupProgressModel.find({ group: groupId });

    return res.status(200).json({
      message: "Successfully fetched data",
      data: progressData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllWeekProgress = async (req, res) => {
  const { bootcampId } = req.params;
  const userId = req.user.id;
  const weekNumber = req.query.week;

  try {
    // check membership
    const isMember = await GroupMemberModel.findOne({
      bootcamp: bootcampId,
      user: userId,
    });

    if (!isMember && bootcamp.leadInstructor.toString() !== userId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    //  query
    const query = {
      bootcamp: bootcampId,
    };

    if (weekNumber) {
      query.weekNumber = Number(weekNumber);
    }

    const progress = await GroupProgressModel.find(query);

    if (progress.length === 0) {
      return res.status(200).json({
        message: "No progress found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Progress fetched successfully",
      data: progress,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMissingGroup = async (req, res) => {
  const { bootcampId, weekNumber } = req.params;

  try {
    const progress = await GroupProgressModel.find({
      bootcamp: bootcampId,
      weekNumber: Number(weekNumber),
    });

    const submittedGroupIds = new Set(progress.map((p) => p.group.toString()));

    // fetch all groups
    const groups = await GroupModel.find({ bootcamp: bootcampId });

    // filter missing
    const missingGroups = groups.filter(
      (g) => !submittedGroupIds.has(g._id.toString()),
    );

    return res.status(200).json({
      message: "Missing groups fetched successfully",
      data: missingGroups,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
