import mongoose from "mongoose";
import Division from "../models/Division.model.js";

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

// list divisions
export async function listDivisionsWithStats() {
  return Division.aggregate([
    { $sort: { name: 1 } },

    // students
    {
      $lookup: {
        from: "users",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$divisionId", "$divisions"] },
                  { $eq: ["$role", "Student"] },
                ],
              },
            },
          },
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
          { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
          { $count: "count" },
        ],
        as: "sessions",
      },
    },

    // groups
    {
      $lookup: {
        from: "groups",
        let: { divisionId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
          { $count: "count" },
        ],
        as: "groups",
      },
    },

    // resources
    {
      $lookup: {
        from: "resources",
        let: { divisionId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
          { $count: "count" },
        ],
        as: "resources",
      },
    },

    {
      $addFields: {
        studentCount: {
          $ifNull: [{ $arrayElemAt: ["$students.count", 0] }, 0],
        },
        sessionCount: {
          $ifNull: [{ $arrayElemAt: ["$sessions.count", 0] }, 0],
        },
        groupCount: { $ifNull: [{ $arrayElemAt: ["$groups.count", 0] }, 0] },
        resourceCount: {
          $ifNull: [{ $arrayElemAt: ["$resources.count", 0] }, 0],
        },
      },
    },

    {
      $project: {
        name: 1,
        description: 1,
        studentCount: 1,
        sessionCount: 1,
        groupCount: 1,
        resourceCount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]).exec();
}

export async function getDivisionStatistics(divisionId) {
  const divisionObjectId = new mongoose.Types.ObjectId(divisionId);

  // Use $facet so all metrics are computed in a single aggregation call.
  const [result] = await Division.aggregate([
    { $match: { _id: divisionObjectId } },
    {
      $facet: {
        students: [
          {
            $lookup: {
              from: "users",
              let: { divisionId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ["$$divisionId", "$divisions"] },
                        { $eq: ["$role", "Student"] },
                      ],
                    },
                  },
                },
                { $count: "count" },
              ],
              as: "agg",
            },
          },
          {
            $project: {
              _id: 0,
              count: { $ifNull: [{ $arrayElemAt: ["$agg.count", 0] }, 0] },
            },
          },
        ],
        sessions: [
          {
            $lookup: {
              from: "sessions",
              let: { divisionId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
                { $count: "count" },
              ],
              as: "agg",
            },
          },
          {
            $project: {
              _id: 0,
              count: { $ifNull: [{ $arrayElemAt: ["$agg.count", 0] }, 0] },
            },
          },
        ],
        attendance: [
          {
            $lookup: {
              from: "sessions",
              let: { divisionId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
                { $project: { _id: 1 } },
              ],
              as: "sessions",
            },
          },
          { $project: { _id: 0, sessionIds: "$sessions._id" } },
          {
            $lookup: {
              from: "attendances",
              let: { sessionIds: "$sessionIds" },
              pipeline: [
                { $match: { $expr: { $in: ["$session", "$$sessionIds"] } } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 },
                    attended: {
                      $sum: {
                        $cond: [
                          { $in: ["$status", ["Present", "Late", "Excused"]] },
                          1,
                          0,
                        ],
                      },
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    attendancePercentage: {
                      $cond: [
                        { $eq: ["$total", 0] },
                        0,
                        {
                          $multiply: [
                            { $divide: ["$attended", "$total"] },
                            100,
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "agg",
            },
          },
          {
            $project: {
              attendancePercentage: {
                $ifNull: [
                  { $arrayElemAt: ["$agg.attendancePercentage", 0] },
                  0,
                ],
              },
            },
          },
        ],
        rating: [
          {
            $lookup: {
              from: "sessions",
              let: { divisionId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$division", "$$divisionId"] } } },
                { $project: { _id: 1 } },
              ],
              as: "sessions",
            },
          },
          { $project: { _id: 0, sessionIds: "$sessions._id" } },
          {
            $lookup: {
              from: "feedbacks",
              let: { sessionIds: "$sessionIds" },
              pipeline: [
                { $match: { $expr: { $in: ["$session", "$$sessionIds"] } } },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } },
                {
                  $project: {
                    _id: 0,
                    avgRating: { $ifNull: ["$avgRating", 0] },
                  },
                },
              ],
              as: "agg",
            },
          },
          {
            $project: {
              averageRating: {
                $ifNull: [{ $arrayElemAt: ["$agg.avgRating", 0] }, 0],
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        studentCount: {
          $ifNull: [{ $arrayElemAt: ["$students.count", 0] }, 0],
        },
        sessionCount: {
          $ifNull: [{ $arrayElemAt: ["$sessions.count", 0] }, 0],
        },
        attendancePercentage: {
          $ifNull: [
            { $arrayElemAt: ["$attendance.attendancePercentage", 0] },
            0,
          ],
        },
        averageRating: {
          $ifNull: [{ $arrayElemAt: ["$rating.averageRating", 0] }, 0],
        },
      },
    },
  ]).exec();

  return {
    studentCount: Number(result?.studentCount ?? 0),
    sessionCount: Number(result?.sessionCount ?? 0),
    attendancePercentage: Number(result?.attendancePercentage ?? 0),
    averageRating: Number(result?.averageRating ?? 0),
  };
}

export async function getDivisionWithStats(divisionId) {
  const result = await Division.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(divisionId),
      },
    },

    // students
    {
      $lookup: {
        from: "users",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$divisionId", "$divisions"] },
                  { $eq: ["$role", "Student"] },
                ],
              },
            },
          },
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

    // groups
    {
      $lookup: {
        from: "groups",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$division", "$$divisionId"] },
            },
          },
          { $count: "count" },
        ],
        as: "groups",
      },
    },

    // resources
    {
      $lookup: {
        from: "resources",
        let: { divisionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$division", "$$divisionId"] },
            },
          },
          { $count: "count" },
        ],
        as: "resources",
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
      },
    },

    // final shape
    {
      $project: {
        name: 1,
        description: 1,
        studentCount: 1,
        sessionCount: 1,
        groupCount: 1,
        resourceCount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]).exec();

  return result[0] || null;
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