import GroupMessageService from "../services/groupMessage.service.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMessageController {

    static async sendMessage(req, res) {
        try {
            const sender_id = req.user.id;
            const { group_id, text } = req.body;

            const message = await GroupMessageService.sendMessage(group_id, sender_id, text);
            res.status(201).json({ 
                ok: true, 
                message: "Mensaje de grupo enviado correctamente.",  
                data: message });
        } catch (error) {
            res.status(error.status || 500).json({ 
                ok: false, 
                message: error.message 
            });
        }
    }

    static async getMessages(req, res) {
        try {
            const user_id = req.user.id;
            const { group_id } = req.params;
            const { limit, sort } = req.query;

            const messages = await GroupMessageService.getMessages(group_id, user_id, {
                limit: limit ? parseInt(limit) : null,
                sort: sort || "asc",
            });

            res.status(200).json({ 
                ok: true,
                message: "Mensajes del grupo obtenidos correctamente.", 
                data: messages });
        } catch (error) {
            res.status(error.status || 500).json({ 
                ok: false, 
                message: error.message 
            });
        }
    }

    static async markAsRead(req, res) {
        try {
            const user_id = req.user.id;
            const { message_id } = req.params;

            const updated = await GroupMessageService.markAsRead(message_id, user_id);
            res.status(200).json({ 
                ok: true, 
                message: "Mensaje de grupo marcado como leído.",
                data: updated });
        } catch (error) {
            res.status(error.status || 500).json({ 
                ok: false, 
                message: error.message 
            });
        }
    }

    static async deleteMessage(req, res) {
        try {
            const user_id = req.user.id;
            const { message_id } = req.params;

            await GroupMessageService.deleteMessage(message_id, user_id);
            res.status(200).json({ 
                ok: true, 
                message: "Mensaje de grupo eliminado correctamente."
            });
        } catch (error) {
            res.status(error.status || 500).json({ 
                ok: false, 
                message: error.message 
            });
        }
    }
}

export default GroupMessageController;
