import BootcampModel from "../models/Bootcamp.model.js";
import EnrollmentModel from "../models/Enrollment.model.js";

export const checkStudent = async (req, res, next) => {
  const userId = req.user.id;
  const { bootcampId } = req.params;

  try {
    const bootcamp = await BootcampModel.findById(bootcampId);

    if (!bootcamp) {
      return res.status(404).json({
        status: "fail",
        message: "Bootcamp not found",
      });
    }
    const enrollment = await EnrollmentModel.findOne({
      student: userId,
      bootcamp: bootcampId,
    });

    if (!enrollment) {
      return res.status(403).json({
        status: "fail",
        message: "You are not enrolled in this bootcamp",
      });
    }

    next();
    return;
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while checking enrollment",
    });
  }
};
