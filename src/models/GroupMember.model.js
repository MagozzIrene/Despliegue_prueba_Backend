import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
    {
        group_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "miembro"],
            default: "miembro",
        },
        joined_at: {
            type: Date,
            default: Date.now,
        },
    },
    { versionKey: false }
);

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
