import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
    {
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
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "El mensaje no puede superar los 1000 caracteres"],
        },
        read_by: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        sent_at: {
            type: Date,
            default: Date.now,
        },
    },
    { versionKey: false }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;
