import MessageService from "../services/message.service.js";
import ContactRepository from "../repositories/contact.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class MessageController {
    static async create(req, res, next) {
        try {
            const senderId = req.user.id;
            const { receiverId, text } = req.body;

            if (!receiverId || !text)
                throw new ServerError(400, "Datos incompletos");

            const contacts = await ContactRepository.getAcceptedContacts(senderId);
            const isContact = contacts.some(contact =>
                contact.requester_id._id.toString() === receiverId ||
                contact.receiver_id._id.toString() === receiverId
            );


            console.log("🧩 Contactos aceptados:", contacts);
            console.log("🧩 ReceiverId:", receiverId);


            if (!isContact)
                throw new ServerError(403, "Solo puedes enviar mensajes a tus contactos");

            const message = await MessageService.sendMessage(senderId, receiverId, text);

            return res.status(201).json({
                ok: true,
                message: "Mensaje enviado correctamente",
                data: message,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getConversation(req, res, next) {
        try {
            const { userId1, userId2 } = req.params;
            const messages = await MessageService.getConversation(userId1, userId2, req.user.id);
            res.status(200).json({ 
                ok: true, 
                message: "Conversación obtenida correctamente.",
                data: messages });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            const { messageId } = req.params;
            const updated = await MessageService.markAsRead(messageId, req.user.id);
            res.status(200).json({ 
                ok: true, 
                message: "Mensaje marcado como leído", 
                data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const { messageId } = req.params;
            const deleted = await MessageService.deleteMessage(messageId, req.user.id);
            res.status(200).json({ 
                ok: true, 
                message: "Mensaje eliminado correctamente", 
                data: deleted });
        } catch (error) {
            next(error);
        }
    }
}

export default MessageController;
