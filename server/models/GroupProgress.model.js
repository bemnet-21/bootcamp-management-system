import mongoose from "mongoose";

const groupProgressSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    instructorFeedback: {
      type: String,
    },
  },
  { timestamps: true },
);

groupProgressSchema.index({ group: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model("GroupProgress", groupProgressSchema);
