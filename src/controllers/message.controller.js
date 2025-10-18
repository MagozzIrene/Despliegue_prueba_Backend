import MessageRepository from "../repositories/message.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class MessageController {
    static async create(request, response, next) {
        try {
            const { senderId, receiverId, text } = request.body;

            if (!senderId || !receiverId || !text)
                throw new ServerError(400, "Datos incompletos");

            const message = await MessageRepository.createMessage(
                senderId,
                receiverId,
                text
            );

            return response.status(201).json({
                ok: true,
                message: "Mensaje enviado correctamente",
                data: message,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getConversation(request, response, next) {
        try {
            const { userId1, userId2 } = request.params;
            const messages = await MessageRepository.getConversation(userId1, userId2);
            return response.status(200).json({
                ok: true,
                data: messages,
            });
        } catch (error) {
            next(error);
        }
    }
    // Prueba

    static async markAsRead(req, res, next) {
        try {
            const { messageId } = req.params;
            const updated = await MessageRepository.markAsRead(messageId);

            if (!updated) return res.status(404).json({ ok: false, message: "Mensaje no encontrado" });

            return res.status(200).json({
                ok: true,
                message: "Mensaje marcado como leído",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { messageId } = req.params;
            const deleted = await MessageRepository.deleteMessage(messageId);

            if (!deleted) return res.status(404).json({ ok: false, message: "Mensaje no encontrado" });

            return res.status(200).json({
                ok: true,
                message: "Mensaje eliminado correctamente",
                data: deleted,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default MessageController;
