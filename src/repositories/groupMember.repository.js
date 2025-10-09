import GroupMember from "../models/GroupMember.model.js";
import Group from "../models/Group.model.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMemberRepository {

    static async addMember(group_id, user_id) {
        const group = await Group.findById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        const existingMember = await GroupMember.findOne({ group_id, user_id });
        if (existingMember) throw new ServerError(400, "El usuario ya es miembro del grupo");

        const member = await GroupMember.create({
            group_id,
            user_id,
            role: group.admin.toString() === user_id.toString() ? "admin" : "miembro",
        });

        return await member.populate("user_id", "name email");
    }

    static async removeMember(group_id, user_id) {
        const group = await Group.findById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (group.admin.toString() === user_id.toString()) {
            throw new ServerError(400, "No se puede remover al administrador del grupo");
        }

        const member = await GroupMember.findOneAndDelete({ group_id, user_id });
        if (!member) throw new ServerError(404, "El usuario no pertenece al grupo");

        return true;
    }

    static async getMembersByGroup(group_id) {
        const members = await GroupMember.find({ group_id })
            .populate("user_id", "name email")
            .populate("group_id", "name description");
        return members;
    }

    static async isMember(group_id, user_id) {
        const member = await GroupMember.findOne({ group_id, user_id });
        return !!member;
    }

    static async getGroupsByUser(user_id) {
        const groups = await GroupMember.find({ user_id }).populate("group_id", "name description");
        return groups.map((m) => m.group_id);
    }

    static async syncMembers(group_id, new_members = []) {
        const group = await Group.findById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        const existingMembers = await GroupMember.find({ group_id });
        const existingUserIds = existingMembers.map((m) => m.user_id.toString());

        const newUniqueMembers = new_members.filter(
            (id) => !existingUserIds.includes(id.toString()) && id.toString() !== group.admin.toString()
        );

        for (const user_id of newUniqueMembers) {
            await GroupMember.create({ group_id, user_id, role: "miembro" });
        }

        return await this.getMembersByGroup(group_id);
    }
}

export default GroupMemberRepository;
