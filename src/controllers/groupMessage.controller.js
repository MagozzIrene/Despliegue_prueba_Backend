import GroupMessageRepository from "../repositories/groupMessage.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMessageController {

    static async sendMessage(req, res) {
        try {
            const { group_id, text } = req.body;
            const sender_id = req.user.id;

            if (!group_id || !text) throw new ServerError(400, "Faltan datos requeridos");

            const message = await GroupMessageRepository.createMessage(group_id, sender_id, text);

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
            res.status(200).json({ ok: true, data: messages });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { message_id } = req.params;
            const user_id = req.user.id;

            if (!message_id) throw new ServerError(400, "Falta el ID del mensaje");

            const updated = await GroupMessageRepository.markAsRead(message_id, user_id);

            res.status(200).json({ ok: true, data: updated });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async deleteMessage(req, res) {
        try {
            const { message_id } = req.params;
            if (!message_id) throw new ServerError(400, "Falta el ID del mensaje");

            await GroupMessageRepository.deleteMessage(message_id);

            res.status(200).json({ ok: true, message: "Mensaje eliminado correctamente" });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }
}

export default GroupMessageController;
