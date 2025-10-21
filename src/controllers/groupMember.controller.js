import GroupMemberRepository from "../repositories/groupMember.repository.js";

class GroupMemberController {
    static async addMember(req, res) {
        try {
            const { group_id, user_id } = req.body;

            const requester_id = req.user.id;


            const member = await GroupMemberRepository.addMember(group_id, user_id, requester_id);
            res.status(201).json({
                ok: true,
                message: "Miembro agregado correctamente ✅",
                data: member
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async removeMember(req, res) {
        try {
            const { group_id, user_id } = req.body;
            await GroupMemberRepository.removeMember(group_id, user_id);
            res.json({ ok: true, message: "Miembro eliminado del grupo 🚫" });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async getMembers(req, res) {
        try {
            const { group_id } = req.params;
            const members = await GroupMemberRepository.getMembersByGroup(group_id);
            res.json({ ok: true, data: members });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async getGroupsByUser(req, res) {
        try {
            const { user_id } = req.params;
            const groups = await GroupMemberRepository.getGroupsByUser(user_id);
            res.json({ ok: true, data: groups });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async syncMembers(req, res) {
        try {
            const { group_id, members } = req.body;
            const updatedMembers = await GroupMemberRepository.syncMembers(group_id, members);
            res.json({
                ok: true,
                message: "Miembros sincronizados correctamente 🔄",
                data: updatedMembers
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }
}

export default GroupMemberController;
