import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    bootcamp: {
      type: Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],  
  },
  { timestamps: true },
);

groupMemberSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

export default mongoose.model("GroupMember", groupMemberSchema);
