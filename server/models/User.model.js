import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ["Admin", "Student"],
        required: true
    },
    divisions: [{ type: Schema.Types.ObjectId, ref: 'Division' }],
    status: { 
        type: String, 
        enum: ["Active", "Suspended", "Graduated"], 
        default: "Active" 
    },
    refreshToken: { type: String },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
        types: {
            sessions: { type: Boolean, default: true },
            grading: { type: Boolean, default: true },
            bootcamp: { type: Boolean, default: true },
            group: { type: Boolean, default: true },
            task: { type: Boolean, default: true },

        }
    }
}, { timestamps: true });

userSchema.index({ role: 1, divisions: 1 });

export default mongoose.model('User', userSchema);
