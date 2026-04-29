import Bootcamp from "../models/Bootcamp.model.js";
import BootcampHelper from "../models/BootcampHelper.model.js";
import Enrollment from "../models/Enrollment.model.js";


export const getBootcampById = async (req, res, next) => {
  try {
    const { bootcampId } = req.params;
    const userId = req.user.id;

    // 1. Find bootcamp
    const bootcamp = await Bootcamp.findById(bootcampId)
      .populate("division_id", "name")
      .populate("leadInstructor", "firstName lastName email")
      .lean();

    if (!bootcamp) {
      return res.status(404).json({
        success: false,
        message: "Bootcamp not found",
      });
    }

    // 2. Check access: Lead Instructor
    const isLeadInstructor = bootcamp.leadInstructor._id.toString() === userId;

    // 3. Check access: Helper
    const isHelper = await BootcampHelper.findOne({
      bootcamp_id: bootcampId,
      user: userId,
    });

    // 4. Check access: Student
    const isStudent = await Enrollment.findOne({
      bootcamp: bootcampId,
      student: userId,
    });

    // 5. Deny if no access
    if (!isLeadInstructor && !isHelper && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this bootcamp",
      });
    }

    // 6. Return bootcamp data
    return res.status(200).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    console.error("Error in getBootcampById:", err);
    return next(err);
  }
};
