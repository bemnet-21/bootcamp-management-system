import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["online", "onPlace"],
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: {
      type: String,
      enum: ["Lab_A", "Lab_B"],
    },
    link: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Cancelled", "Completed"],
      default: "Scheduled",
    },
  },
  { timestamps: true },
);

sessionSchema.pre("validate", function (next) {
  if (this.type === "online" && !this.link) {
    return next(new Error("Online session must have a link"));
  }

  if (this.type === "onPlace" && !this.location) {
    return next(new Error("On-site session must have a location"));
  }
  next();
});

sessionSchema.index({ division: 1, startTime: 1, endTime: 1 });

export default mongoose.model("Session", sessionSchema);
