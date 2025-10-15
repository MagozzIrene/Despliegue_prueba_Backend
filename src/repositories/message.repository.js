import Message from "../models/Message.model.js";

class MessageRepository {
    static async createMessage(senderId, receiverId, text) {
        return await Message.create({
            sender: senderId,
            receiver: receiverId,
            text,
        });
    }

    static async getConversation(userId1, userId2) {
        return await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 },
            ],
        })
            .sort({ sent_at: 1 })
            .populate("sender", "name email")
            .populate("receiver", "name email");
    }

    //Prueba

    static async markAsRead(message_id) {
        return await Message.findByIdAndUpdate(
            message_id,
            { read: true },
            { new: true }
        );
    }

    static async deleteMessage(messageId) {
        return await Message.findByIdAndDelete(messageId);
    }
}

export default MessageRepository;
