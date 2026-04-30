// add array of helpers which have bootcmap id from bootcamp and also user id from user
import mongoose from "mongoose";
import { type } from "node:os";

const permissionSchema = new mongoose.Schema(
  {
    studentManagement: { type: Boolean, default: false },
    sessions: { type: Boolean, default: false },
    attendance: { type: Boolean, default: false },
    content: { type: Boolean, default: false },
    tasks: { type: Boolean, default: false },
    groups: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
  },
  { _id: false }, // important: prevents extra _id
);
const bootcampMemberSchema = new mongoose.Schema(
  {
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: {
      type: permissionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);
bootcampMemberSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

export default mongoose.model("BootcampMember", bootcampMemberSchema);
