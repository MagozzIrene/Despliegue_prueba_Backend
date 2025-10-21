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

groupMemberSchema.pre("findOneAndDelete", async function (next) {
    try {
        const membership = await this.model.findOne(this.getQuery());
        if (!membership) return next();

        const GroupMessage = (await import("./GroupMessage.model.js")).default;

        await GroupMessage.deleteMany({
            group_id: membership.group_id,
            sender_id: membership.user_id,
        });

        console.log(
            `Mensajes del usuario ${membership.user_id} en el grupo ${membership.group_id} eliminados al quitar la membresía.`
        );

        next();
    } catch (error) {
        console.error("Error en cascade delete de GroupMember:", error);
        next(error);
    }
});

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

export default GroupMember;
