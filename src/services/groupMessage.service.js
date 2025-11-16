import GroupMessageRepository from "../repositories/groupMessage.repository.js";
import GroupMemberRepository from "../repositories/groupMember.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMessageService {

    static async sendMessage(group_id, sender_id, text) {
        if (!group_id || !sender_id || !text) {
            throw new ServerError(400, "Faltan datos requeridos para enviar mensaje");
        }

        if (text.length > 1000)
            throw new ServerError(400, "El mensaje no puede superar los 1000 caracteres");

        const isMember = await GroupMemberRepository.isMember(group_id, sender_id);
        if (!isMember) throw new ServerError(403, "No sos miembro de este grupo");

        const group = await (await import("../repositories/group.repository.js")).default.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");
        if (!group.active)
            throw new ServerError(403, "Este grupo está inactivo. No se pueden enviar mensajes.");

        try {
            return await GroupMessageRepository.createMessage(group_id, sender_id, text);
        } catch (error) {
            if (error.name === "ValidationError") {
                throw new ServerError(400, error.message);
            }
            throw error;
        }
    }

    static async getMessages(group_id, user_id, { limit = null, sort = "asc" } = {}) {
        if (!group_id) throw new ServerError(400, "Falta el ID del grupo");

        const isMember = await GroupMemberRepository.isMember(group_id, user_id);
        if (!isMember) throw new ServerError(403, "No tenés acceso a este grupo");

        const group = await (await import("../repositories/group.repository.js")).default.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");
        if (!group.active)
            throw new ServerError(403, "Este grupo está inactivo. No se pueden ver mensajes.");

        return await GroupMessageRepository.getMessagesByGroup(group_id, { limit, sort });
    }

    static async markAsRead(message_id, user_id) {
        if (!message_id) throw new ServerError(400, "Falta el ID del mensaje");

        const message = await GroupMessageRepository.getById(message_id);
        if (!message) throw new ServerError(404, "Mensaje no encontrado");

        const isMember = await GroupMemberRepository.isMember(message.group_id, user_id);
        if (!isMember) throw new ServerError(403, "No sos miembro de este grupo");

        if (String(message.sender_id) === String(user_id))
            throw new ServerError(403, "No podés marcar como leído tu propio mensaje");

        return await GroupMessageRepository.markAsRead(message_id, user_id);
    }

    static async deleteMessage(message_id, user_id) {
        if (!message_id) throw new ServerError(400, "Falta el ID del mensaje");

        const message = await GroupMessageRepository.getById(message_id);
        if (!message) throw new ServerError(404, "Mensaje no encontrado");

        const isMember = await GroupMemberRepository.isMember(message.group_id, user_id);
        if (!isMember) throw new ServerError(403, "No sos miembro de este grupo");

        if (String(message.sender_id) !== String(user_id))
            throw new ServerError(403, "Solo el emisor puede eliminar su mensaje");

        return await GroupMessageRepository.deleteMessage(message_id);
    }
}

export default GroupMessageService;
