import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

groupSchema.index({ name: 1, bootcamp: 1 }, { unique: true });

export default mongoose.model("Group", groupSchema);
