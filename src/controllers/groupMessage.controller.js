import GroupMessageRepository from "../repositories/groupMessage.repository.js";

class GroupMessageController {
    static async sendMessage(req, res) {
        try {
            const { group_id, sender_id, text } = req.body;
            const message = await GroupMessageRepository.createMessage(
                group_id,
                sender_id,
                text
            );
            res.status(201).json({ ok: true, data: message });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async getMessages(req, res) {
        try {
            const { group_id } = req.params;
            const messages = await GroupMessageRepository.getMessagesByGroup(group_id);
            res.json({ ok: true, data: messages });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { message_id, user_id } = req.body;
            const updated = await GroupMessageRepository.markAsRead(message_id, user_id);
            res.json({ ok: true, data: updated });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async deleteMessage(req, res) {
        try {
            const { message_id } = req.params;
            await GroupMessageRepository.deleteMessage(message_id);
            res.json({ ok: true, message: "Mensaje eliminado correctamente" });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }
}

export default GroupMessageController;
