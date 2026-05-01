
import mongoose from "mongoose";
import Division from "../models/Division.model.js";
import Bootcamp from "../models/Bootcamp.model.js";
import User from "../models/User.model.js";
import UserModel from "../models/User.model.js";

// create a new division
export async function createDivision(payload) {
  return Division.create(payload);
}

// update division

export async function updateDivision(id, updates) {
  const updated = await Division.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  return updated;
}

// Get a division by its id
export async function getDivisionById(id) {
  return Division.findById(id);
}

// list divisions
export async function listDivisionsWithStats() {
  return Division.aggregate([
    { $sort: { name: 1 } },

    // students (via enrollment → bootcamp → division)
    {
      $lookup: {
        from: "enrollments",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $lookup: {
              from: "bootcamps",
              localField: "bootcamp",
              foreignField: "_id",
              as: "bootcampData",
            },
          },
          { $unwind: "$bootcampData" },

          {
            $match: {
              $expr: {
                $eq: ["$bootcampData.division_id", "$$divisionId"],
              },
            },
          },

          { $group: { _id: "$student" } },
          { $count: "count" },
        ],
        as: "students",
      },
    },

    // sessions
    {
      $lookup: {
        from: "sessions",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$division", "$$divisionId"] },
            },
          },
          { $count: "count" },
        ],
        as: "sessions",
      },
    },

    // groups (via bootcamp → division)
    {
      $lookup: {
        from: "groups",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $lookup: {
              from: "bootcamps",
              localField: "bootcamp",
              foreignField: "_id",
              as: "bootcampData",
            },
          },
          { $unwind: "$bootcampData" },

          {
            $match: {
              $expr: {
                $eq: ["$bootcampData.division_id", "$$divisionId"],
              },
            },
          },

          { $count: "count" },
        ],
        as: "groups",
      },
    },

    // resources (via bootcamp → division)
    {
      $lookup: {
        from: "resources",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $lookup: {
              from: "bootcamps",
              localField: "bootcamp",
              foreignField: "_id",
              as: "bootcampData",
            },
          },
          { $unwind: "$bootcampData" },

          {
            $match: {
              $expr: {
                $eq: ["$bootcampData.division_id", "$$divisionId"],
              },
            },
          },

          { $count: "count" },
        ],
        as: "resources",
      },
    },

    // ✅ NEW: bootcamps per division (SIMPLE + DIRECT)
    {
      $lookup: {
        from: "bootcamps",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$division_id", "$$divisionId"],
              },
            },
          },
          { $count: "count" },
        ],
        as: "bootcamps",
      },
    },

    // flatten counts
    {
      $addFields: {
        studentCount: {
          $ifNull: [{ $arrayElemAt: ["$students.count", 0] }, 0],
        },
        sessionCount: {
          $ifNull: [{ $arrayElemAt: ["$sessions.count", 0] }, 0],
        },
        groupCount: {
          $ifNull: [{ $arrayElemAt: ["$groups.count", 0] }, 0],
        },
        resourceCount: {
          $ifNull: [{ $arrayElemAt: ["$resources.count", 0] }, 0],
        },
        bootcampCount: {
          $ifNull: [{ $arrayElemAt: ["$bootcamps.count", 0] }, 0],
        },
      },
    },

    // final response shape
    {
      $project: {
        name: 1,
        description: 1,
        studentCount: 1,
        sessionCount: 1,
        groupCount: 1,
        resourceCount: 1,
        bootcampCount: 1,
        isDeleted: 1,
        deletedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]).exec();
}
// Fetch number of bootcamps and total lead instructors in a given division
export async function getDivisionStatistics(divisionId) {
  // Count bootcamps in the division (using division_id)
  const bootcampCount = await Bootcamp.countDocuments({ division_id: divisionId });

  // Find all bootcamps in the division
  const bootcamps = await Bootcamp.find({ division_id: divisionId }, 'leadInstructor');
  // Get all unique lead instructor IDs (filter out nulls)
  const leadInstructorIds = bootcamps
    .map(b => b.leadInstructor)
    .filter(id => !!id);
  // Count unique lead instructors
  const uniqueLeadInstructorCount = new Set(leadInstructorIds.map(id => id.toString())).size;

  // Count students in the division
  const studentCount = await UserModel.countDocuments({
    divisions: divisionId,
    role: 'Student'
  });

  return {
    bootcampCount,
    leadInstructorCount: uniqueLeadInstructorCount,
    studentCount
  };
}

// delete division

export async function deleteDivision(id) {
  return Division.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    { new: true },
  );
}

// reactivate division

export async function reactivateDivision(id) {
  return Division.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: true,
    },
    {
      $set: {
        isDeleted: false,
      },
      $unset: {
        deletedAt: "",
      },
    },
    { new: true },
  );
}