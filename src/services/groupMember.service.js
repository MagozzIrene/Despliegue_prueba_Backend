import GroupMemberRepository from "../repositories/groupMember.repository.js";
import GroupRepository from "../repositories/group.repository.js";
import { ServerError } from "../utils/customError.utils.js";
import GroupMessage from "../models/GroupMessage.model.js";
import GroupMember from "../models/GroupMember.model.js";

class GroupMemberService {

    static async addMember(group_id, admin_id, user_id) {
        if (!group_id || !admin_id || !user_id)
            throw new ServerError(400, "Faltan datos requeridos");

        if (admin_id === user_id)
            throw new ServerError(400, "No podés agregarte a vos mismo");

        const group = await GroupRepository.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (!group.active)
            throw new ServerError(403, "El grupo no está activo");

        const groupAdminId = group.admin?._id?.toString() || group.admin?.toString();
        if (groupAdminId !== admin_id.toString())
            throw new ServerError(403, "Solo el admin puede agregar miembros");

        const existing = await GroupMemberRepository.findByGroupAndUser(group_id, user_id);
        if (existing)
            throw new ServerError(400, "El usuario ya es miembro del grupo");

        return await GroupMemberRepository.addMember(group_id, user_id);
    }

    static async getMembers(group_id, requester_id) {
        if (!group_id) throw new ServerError(400, "Falta el ID del grupo");

        const isMember = await GroupMemberRepository.isMember(group_id, requester_id);
        if (!isMember)
            throw new ServerError(403, "No sos miembro de este grupo");

        return await GroupMemberRepository.getMembersByGroup(group_id);
    }

    static async removeMember(group_id, admin_id, member_id) {
        if (!group_id || !member_id)
            throw new ServerError(400, "Faltan parámetros");

        const group = await GroupRepository.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (String(group.admin) !== String(admin_id))
            throw new ServerError(403, "Solo el admin puede eliminar miembros");

        if (String(admin_id) === String(member_id))
            throw new ServerError(400, "El admin no puede eliminarse a sí mismo");

        return await GroupMemberRepository.removeMember(group_id, member_id);
    }

    static async changeRole(group_id, admin_id, member_id, newRole) {
        if (!group_id || !member_id || !newRole)
            throw new ServerError(400, "Faltan datos requeridos");

        const group = await GroupRepository.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (String(group.admin) !== String(admin_id))
            throw new ServerError(403, "Solo el admin puede cambiar roles");

        const validRoles = ["admin", "miembro"];
        if (!validRoles.includes(newRole))
            throw new ServerError(400, "Rol inválido");

        return await GroupMemberRepository.changeRole(group_id, member_id, newRole);
    }

    static async getGroupsByUser(user_id) {
        if (!user_id) throw new ServerError(400, "Falta el ID del usuario");

        const memberships = await GroupMember.find({ user_id })
            .populate("group_id", "name description avatar created_at");

        const result = [];

        for (const m of memberships) {
            const g = m.group_id;
            if (!g) continue;

            const lastMsg = await GroupMessage.findOne({ group_id: g._id })
                .sort({ sent_at: -1 })
                .select("text sent_at sender_id")
                .populate("sender_id", "name")

            result.push({
                _id: g._id,
                name: g.name,
                description: g.description || "",
                avatar: g.avatar || "",
                created_at: g.created_at,
                last_message: lastMsg?.text || "",
                last_message_time: lastMsg?.sent_at || null,
                last_message_sender: lastMsg?.sender_id?.name || null,
                unread_count: 0,
            });
        }

        result.sort((a, b) => {
            const tA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
            const tB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
            return tB - tA;
        });

        return result;
    }

    static async syncMembers(group_id, admin_id, members) {
        if (!group_id || !Array.isArray(members))
            throw new ServerError(400, "Datos inválidos");

        const group = await GroupRepository.getById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (String(group.admin) !== String(admin_id))
            throw new ServerError(403, "Solo el admin puede sincronizar miembros");

        const uniqueMembers = [...new Set(members)].filter(
            (id) => String(id) !== String(admin_id)
        );

        return await GroupMemberRepository.syncMembers(group_id, uniqueMembers);
    }
}

export default GroupMemberService;
