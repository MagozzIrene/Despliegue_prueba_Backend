import GroupMemberService from "../services/groupMember.service.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMemberController {
    static async addMember(req, res) {
        try {
            const admin_id = req.user.id;
            const { group_id, user_id } = req.body;

            const member = await GroupMemberService.addMember(group_id, admin_id, user_id);

            res.status(201).json({
                ok: true,
                message: "Miembro agregado correctamente",
                data: member,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al agregar miembro",
            });
        }
    }

    static async getMembers(req, res) {
        try {
            const requester_id = req.user.id;
            const { group_id } = req.params;

            const members = await GroupMemberService.getMembers(group_id, requester_id);
            res.status(200).json({ ok: true, data: members });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al obtener miembros",
            });
        }
    }

    static async removeMember(req, res) {
        try {
            const admin_id = req.user.id;
            const { group_id, member_id } = req.params;

            await GroupMemberService.removeMember(group_id, admin_id, member_id);
            res.status(200).json({ ok: true, message: "Miembro eliminado correctamente" });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al eliminar miembro",
            });
        }
    }

    static async changeRole(req, res) {
        try {
            const admin_id = req.user.id;
            const { group_id, member_id } = req.params;
            const { newRole } = req.body;

            const updated = await GroupMemberService.changeRole(group_id, admin_id, member_id, newRole);
            res.status(200).json({
                ok: true,
                message: "Rol actualizado correctamente",
                data: updated,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al actualizar rol",
            });
        }
    }

        static async getGroupsByUser(req, res) {
    try {
        const user_id = req.user.id;
        const groups = await GroupMemberService.getGroupsByUser(user_id);
        res.status(200).json({ ok: true, data: groups });
    } catch (error) {
        res.status(error.status || 500).json({
            ok: false,
            message: error.message || "Error al obtener grupos del usuario",
        });
    }
}

    static async syncMembers(req, res) {
        try {
            const admin_id = req.user.id;
            const { group_id, members } = req.body;

            const updatedMembers = await GroupMemberService.syncMembers(group_id, admin_id, members);
            res.status(200).json({
                ok: true,
                message: "Miembros sincronizados correctamente",
                data: updatedMembers,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al sincronizar miembros",
            });
        }
    }
}

export default GroupMemberController;
