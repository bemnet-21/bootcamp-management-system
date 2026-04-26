import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema(
  {
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "dropped", "completed"],
      default: "active",
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

enrollmentSchema.index({ bootcamp: 1, student: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
