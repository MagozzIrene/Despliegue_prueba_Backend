import GroupMessage from "../models/GroupMessage.model.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMessageRepository {
    static async createMessage(group_id, sender_id, text) {
        if (!group_id || !sender_id || !text) {
            throw new ServerError(400, "Datos incompletos para enviar mensaje");
        }

        const message = await GroupMessage.create({
            group_id,
            sender_id,
            text,
        });

        return await message.populate([
            { path: "sender_id", select: "name email avatar" },
            { path: "group_id", select: "name avatar" },
        ]);
    }

    static async getMessagesByGroup(group_id) {
        const messages = await GroupMessage.find({ group_id })
            .populate("sender_id", "name email avatar")
            .populate("group_id", "name avatar")
            .sort({ sent_at: 1 });

        return messages;
    }

    static async markAsRead(message_id, user_id) {
        const message = await GroupMessage.findByIdAndUpdate(
            message_id,
            { $addToSet: { read_by: user_id } },
            { new: true }
        )
            .populate("sender_id", "name email avatar")
            .populate("read_by", "name email avatar");

        if (!message) throw new ServerError(404, "Mensaje no encontrado");
        return message;
    }

    static async deleteMessage(message_id) {
        const deleted = await GroupMessage.findByIdAndDelete(message_id);
        if (!deleted) throw new ServerError(404, "Mensaje no encontrado");
        return deleted;
    }
}

export default GroupMessageRepository;
