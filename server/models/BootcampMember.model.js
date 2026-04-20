// add array of helpers which have bootcmap id from bootcamp and also user id from user
import mongoose from "mongoose";

const bootcampMemberSchema = new mongoose.Schema(
  {
    bootcamp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["leadInstructor", "helper", "student"],
      required: true,
    },

    permissions: {
      studentManagement: { type: Boolean, default: false },
      sessions: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      content: { type: Boolean, default: false },
      tasks: { type: Boolean, default: false },
      groups: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

bootcampMemberSchema.index({ bootcamp_id: 1, user: 1 }, { unique: true });
export default mongoose.model("BootcampMember", bootcampMemberSchema);
