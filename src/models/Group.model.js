import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { versionKey: false }
);

const Groups = mongoose.model("Group", groupSchema);
export default Groups;
