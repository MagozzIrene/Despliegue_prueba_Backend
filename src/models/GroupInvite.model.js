import mongoose from "mongoose";

const groupInviteSchema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver_email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pendiente", "aceptado", "rechazado"],
        default: "pendiente",
    },

}, { timestamps: true });

export default mongoose.model("GroupInvite", groupInviteSchema);
