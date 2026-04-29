import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpecs } from "./swagger.js";

import authRoutes from './routes/auth.routes.js'
import connectDB from './db/db.js'
import userRoutes from './routes/user.routes.js'
import resourceRoutes from './routes/resource.routes.js'
import divisionRoutes from './routes/division.routes.js'
import sessionRoutes from './routes/session.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import adminBootcampRoutes from './routes/adminBootcamp.routes.js'
import taskRoutes from './routes/task.routes.js'
import studentTaskRoutes from './routes/studentTask.routes.js'
import studentSubmissionRoutes from './routes/studentSubmission.routes.js'
import instructorRoutes from "./routes/instructor.routes.js";
import groupsRoute from "./routes/groups.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import gradingRoutes from "./routes/grading.routes.js";
import studentFeedbackRoutes from "./routes/studentFeedback.routes.js";
import instructorFeedbackRoutes from "./routes/instructorFeedback.routes.js";
import rosterRoutes from "./routes/roster.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import protect from "./middlewares/auth.js";
import BootcampModel from "./models/Bootcamp.model.js";
import analyticsRoutes from './routes/analytics.routes.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/auth', authRoutes)


app.use('/admin/users', userRoutes)
app.use('/admin/bootcamps', adminBootcampRoutes)
app.use("/admin/divisions", divisionRoutes);
app.use("/admin/reports", reportsRoutes);

app.use("/bootcamps/:bootcampId/instructor", instructorRoutes);
app.use("/bootcamps/:bootcampId/groups", groupsRoute);
app.use("/bootcamps/:bootcampId/sessions", sessionRoutes);
app.use("/bootcamps/:bootcampId/students", rosterRoutes);
app.use("/bootcamps/:bootcampId/progress/", progressRoutes);
app.use("/bootcamps/:bootcampId/analytics" , analyticsRoutes);
app.use('/bootcamps/:bootcampId/:sessionId/resources', resourceRoutes)
app.use('/bootcamps/:bootcampId/resources', resourceRoutes)
app.use('/bootcamps/:bootcampId/tasks', taskRoutes)
app.use("/bootcamps/:bootcampId/students", rosterRoutes);
app.use("/bootcamps/:bootcampId/analytics" , analyticsRoutes);


app.use('/student/tasks', studentTaskRoutes)
app.use('/student/submissions', studentSubmissionRoutes)
app.use("/instructor/bootcamps/:bootcampId/submissions/", gradingRoutes)
app.use('/instructor/bootcamps/:bootcampId/', instructorFeedbackRoutes)
app.use('/student/sessions', studentFeedbackRoutes)
app.use('/notifications', notificationsRoutes)
app.use('/', attendanceRoutes)

app.use('/bootcamps/:bootcampId/permissions', protect,async (req, res, next) => {
      const { bootcampId } = req.params;
      const userId = req.user.id;

      try {
        const bootcamp = await BootcampModel.findById(bootcampId);
        const isLeadInstructor = bootcamp.leadInstructor.toString() === userId;
        
        res.json({
          isLeadInstructor
        })
      } catch(err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
      }
})


app.use((err, req, res, next) => {
  console.error(err);
  let message = "Internal server error.";
  if (err) {
    if (typeof err === "string") message = err;
    else if (err.message) message = err.message;
    else if (err.error) message = err.error;
  }
  res.status(err.status || 500).json({
    error: err.name || "Server Error",
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

await connectDB();

app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
