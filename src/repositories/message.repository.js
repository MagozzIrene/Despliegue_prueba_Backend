import Message from "../models/Message.model.js";

class MessageRepository {
    static async createMessage(senderId, receiverId, text) {
        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text,
        });

        await message.populate([
            { path: "sender", select: "name email avatar" },
            { path: "receiver", select: "name email avatar" },
        ]);
        return message;
    }


    static async getConversation(userId1, userId2) {
        return await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 },
            ],
        })
            .sort({ sent_at: 1 })
            .populate("sender", "name email avatar")
            .populate("receiver", "name email avatar");
    }

    //Prueba

    static async markAsRead(message_id) {
        const updated = await Message.findByIdAndUpdate(
            message_id,
            { read: true },
            { new: true }
        )

            .populate("sender", "name email avatar")
            .populate("receiver", "name email avatar");

        return updated;

    }

    static async deleteMessage(messageId) {
        const deleted = await Message.findByIdAndDelete(messageId);
        return deleted;
    }
}

export default MessageRepository;
