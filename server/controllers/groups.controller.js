import { z } from "zod";
import userModel from "../models/User.model.js";
import GroupModel from "../models/Group.model.js";
import GroupMemberModel from "../models/groupMember.model.js";

export const createGroupSchema = z.object({
  name: z.string().min(2, "group name is required").trim(),
});

export const createGroup = async (req, res) => {
  try {
    const validatedData = createGroupSchema.parse(req.body);
    const { bootcampId } = req.params;

    validatedData.bootcamp = bootcampId;

    //  Create Group
    const group = await GroupModel.create({
      name: validatedData.name,
      bootcamp: bootcampId,
    });

    return res.status(201).json({
      success: true,
      data: group,
      message: "Group created successfully",
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

// export const createGroup = async (req, res) => {
//   try {
//     const validatedData = createGroupSchema.parse(req.body);
//     const { bootcampId } = req.params;

//     validatedData.bootcamp = bootcampId;

//     // //  Validate students exist
//     // if (validatedData.students?.length) {
//     //   const users = await UserModel.find({
//     //     _id: { $in: validatedData.students },
//     //   });

//     //   if (users.length !== validatedData.students.length) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "One or more student IDs are invalid",
//     //     });
//     //   }
//     // }

//     // //  Validate mentors exist
//     // if (validatedData.mentors?.length) {
//     //   const mentors = await UserModel.find({
//     //     _id: { $in: validatedData.mentors },
//     //   });

//     //   if (mentors.length !== validatedData.mentors.length) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "One or more mentor IDs are invalid",
//     //     });
//     //   }
//     // }

//     // //  Prevent duplicates
//     // if (validatedData.students?.length) {
//     //   const existing = await GroupMemberModel.find({
//     //     bootcamp: bootcampId,
//     //     user: { $in: validatedData.students },
//     //   });

//     //   if (existing.length > 0) {
//     //     return res.status(400).json({
//     //       error: "Validation Error",
//     //       message: "Some students already belong to a group in this bootcamp",
//     //     });
//     //   }
//     // }

//     //  Create Group
//     const group = await GroupModel.create({
//       name: validatedData.name,
//       bootcamp: bootcampId,
//     });

//     // // Build membership rows
//     // const members = [];

//     // // students
//     // if (validatedData.students?.length) {
//     //   for (const studentId of validatedData.students) {
//     //     members.push({
//     //       group: group._id,
//     //       bootcamp: bootcampId,
//     //       user: studentId,
//     //       mentors: [],
//     //     });
//     //   }
//     // }

//     // // mentors (attached as separate membership entries OR shared field)
//     // if (validatedData.mentors?.length) {
//     //   for (const mentorId of validatedData.mentors) {
//     //     members.push({
//     //       group: group._id,
//     //       bootcamp: bootcampId,
//     //       user: mentorId,
//     //       mentors: [],
//     //     });
//     //   }
//     // }

//     // // 6. Bulk insert membership
//     // if (members.length) {
//     //   await GroupMemberModel.insertMany(members);
//     // }

//     return res.status(201).json({
//       success: true,
//       data: group,
//       message: "Group created successfully",
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         error: "Validation Error",
//         message: error.issues[0].message,
//       });
//     }

//     return res.status(500).json({
//       error: "Internal Server Error",
//       message: error.message,
//     });
//   }
// };
