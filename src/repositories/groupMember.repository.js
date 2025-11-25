import GroupMember from "../models/GroupMember.model.js";
import Group from "../models/Group.model.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupMemberRepository {

    static async addMember(group_id, user_id) {
        const group = await Group.findById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        if (!group.active)
            throw new ServerError(403, "No se pueden agregar miembros a un grupo inactivo");

        const existingMember = await GroupMember.findOne({ group_id, user_id });
        if (existingMember) throw new ServerError(400, "El usuario ya es miembro del grupo");

        const member = await GroupMember.create({
            group_id,
            user_id,
            role: group.admin.toString() === user_id.toString() ? "admin" : "miembro",
        });

        return await member.populate("user_id", "name email avatar");
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
            .populate("user_id", "name email avatar")
            .populate("group_id", "name description avatar");
        return members;
    }

    static async isMember(group_id, user_id) {
        const member = await GroupMember.findOne({ group_id, user_id });
        return !!member;
    }

    static async getGroupsByUser(user_id) {
        return await GroupMember.find({ user_id })
            .populate("group_id", "name description avatar")
            .populate("user_id", "name email avatar");
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

    static async findByGroupAndUser(group_id, user_id) {
        return await GroupMember.findOne({ group_id, user_id });
    }

    static async changeRole(group_id, member_id, newRole) {
        const validRoles = ["admin", "miembro"];
        if (!validRoles.includes(newRole))
            throw new ServerError(400, "Rol inválido");

        const updated = await GroupMember.findOneAndUpdate(
            { group_id, user_id: member_id },
            { role: newRole },
            { new: true }
        ).populate("user_id", "name email");

        if (!updated)
            throw new ServerError(404, "Miembro no encontrado");

        return updated;
    }
}

export default GroupMemberRepository;
