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

            response.status(201).json(message);
        } catch (error) {
            next(error);
        }
    }

    static async getConversation(request, response, next) {
        try {
            const { userId1, userId2 } = request.params;
            const messages = await MessageRepository.getConversation(userId1, userId2);
            response.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    }

    // Prueba

    static async markAsRead(req, res, next) {
        try {
            const { messageId } = req.params;
            const updatedMessage = await MessageRepository.markAsRead(messageId);
            if (!updatedMessage) {
                return res.status(404).json({ message: "Mensaje no encontrado" });
            }
            res.status(200).json(updatedMessage);
        } catch (error) {
            next(error);
        }
    }

    static async delete(request, response, next) {
        try {
            const { messageId } = request.params;
            await MessageRepository.deleteMessage(messageId);
            response.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default MessageController;
