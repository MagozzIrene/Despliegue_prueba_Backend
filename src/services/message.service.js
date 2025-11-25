import MessageRepository from "../repositories/message.repository.js";
import ContactRepository from "../repositories/contact.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class MessageService {
    
    static async sendMessage(sender_id, receiver_id, text) {
        if (!sender_id || !receiver_id || !text)
            throw new ServerError(400, "Faltan datos requeridos");
        if (sender_id === receiver_id)
            throw new ServerError(400, "No puedes enviarte mensajes a ti mismo");
            if (text.length > 1000)
        throw new ServerError(400, "El mensaje no puede superar los 1000 caracteres");

        const contacts = await ContactRepository.getAcceptedContacts(sender_id);
        const isContact = contacts.some(c =>
            c.requester_id._id.toString() === receiver_id ||
            c.receiver_id._id.toString() === receiver_id
        );
        if (!isContact)
            throw new ServerError(403, "Solo puedes enviar mensajes a tus contactos");

        try {
            return await MessageRepository.createMessage(sender_id, receiver_id, text);
        } catch (error) {
            if (error.name === "ValidationError") {
                throw new ServerError(400, error.message);
            }
            throw error;
        }
    }

    static async getConversation(userA_id, userB_id, currentUserId) {
        if (!userA_id || !userB_id)
            throw new ServerError(400, "Faltan los IDs de los usuarios");

        const isParticipant =
            [userA_id, userB_id].includes(currentUserId);
        if (!isParticipant)
            throw new ServerError(403, "No tienes permiso para ver esta conversación");

        return await MessageRepository.getConversation(userA_id, userB_id);
    }

    static async markAsRead(message_id, currentUserId) {
        if (!message_id)
            throw new ServerError(400, "Falta el ID del mensaje");

        const msg = await MessageRepository.getById(message_id);
        if (!msg) throw new ServerError(404, "Mensaje no encontrado");

        if (String(msg.sender) === String(currentUserId))
            throw new ServerError(403, "No podés marcar como leído un mensaje que enviaste");

        if (String(msg.receiver) !== String(currentUserId))
            throw new ServerError(403, "Solo el receptor puede marcar este mensaje como leído");

        if (msg.read) return await MessageRepository.getByIdPopulated(message_id);

        const updated = await MessageRepository.markAsRead(message_id);
        return updated;
    }

    static async deleteMessage(message_id, currentUserId) {
        if (!message_id)
            throw new ServerError(400, "Falta el ID del mensaje");

        const msg = await MessageRepository.getById(message_id);
        if (!msg) throw new ServerError(404, "Mensaje no encontrado");

        if (String(msg.sender) !== String(currentUserId))
            throw new ServerError(403, "Solo el emisor puede eliminar su mensaje");

        return await MessageRepository.deleteMessage(message_id);
    }
}

export default MessageService;
