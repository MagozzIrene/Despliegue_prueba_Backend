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

groupSchema.pre("findOneAndDelete", async function (next) {
    try {
        const groupId = this.getQuery()._id;

        const GroupMember = (await import("./GroupMember.model.js")).default;
        const GroupMessage = (await import("./GroupMessage.model.js")).default;

        await Promise.all([
            GroupMember.deleteMany({ group_id: groupId }),
            GroupMessage.deleteMany({ group_id: groupId }),
        ]);

        console.log(`Grupo ${groupId} eliminado junto con sus mensajes y miembros.`);
        next();
    } catch (error) {
        console.error("Error en eliminación en cascada de grupo:", error);
        next(error);
    }
});


const Groups = mongoose.model("Group", groupSchema);
export default Groups;
