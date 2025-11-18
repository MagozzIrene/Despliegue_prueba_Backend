import mongoose from "mongoose";

import Contact from "./Contact.model.js";
import Message from "./Message.model.js";
import Group from "./Group.model.js";
import GroupMember from "./GroupMember.model.js";
import GroupMessage from "./GroupMessage.model.js";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        verified_email: {
            type: Boolean,
            required: true,
            default: false
        },
        avatar: {
            type: String,
            default: ""
        },
        active: {
            type: Boolean,
            default: true
        },
        last_seen: { 
            type: Date, 
            default: null 
        },
        is_online: { 
            type: Boolean, 
            default: false 
        },
        last_ping: { 
            type: Date, 
            default: null 
        },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "modified_at" } }
)

userSchema.pre("findOneAndDelete", async function (next) {
    try {
        const userId = this.getQuery()._id;

        await Contact.deleteMany({
            $or: [{ requester_id: userId }, { receiver_id: userId }]
        });

        await Message.deleteMany({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        const groups = await Group.find({ admin: userId });
        const groupIds = groups.map(g => g._id);

        if (groupIds.length > 0) {
            await Promise.all([
                GroupMember.deleteMany({ group_id: { $in: groupIds } }),
                GroupMessage.deleteMany({ group_id: { $in: groupIds } }),
                Group.deleteMany({ _id: { $in: groupIds } })
            ]);
        }

        await GroupMember.deleteMany({ user_id: userId });

        console.log(`Datos relacionados con el usuario ${userId} eliminados.`);
        next();
    } catch (error) {
        console.error("Error en eliminación en cascada de usuario:", error);
        next(error);
    }
});

const Users = mongoose.model('User', userSchema)

export default Users