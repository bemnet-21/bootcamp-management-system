import mongoose, { Schema } from "mongoose";

const bootcampSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    division_id: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leadInstructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    isActive: { type: Boolean, default: true , index:true},
  },
  { timestamps: true },
);

export default mongoose.model("Bootcamp", bootcampSchema);
