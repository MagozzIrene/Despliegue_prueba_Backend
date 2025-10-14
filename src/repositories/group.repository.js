import Groups from "../models/Group.model.js";
import GroupMember from "../models/GroupMember.model.js";
import GroupMemberRepository from "./groupMember.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupRepository {
    static async createGroup(name, description, admin, members = []) {
        if (!name || !admin)
            throw new ServerError(400, "Nombre y admin son obligatorios");

        const group = await Groups.create({ name, description, admin });

        await GroupMemberRepository.addMember(group._id, admin);

        await GroupMemberRepository.syncMembers(group._id, members);

        return await this.getById(group._id);
    }

    static async getAll() {
        return await Groups.find()
            .populate("admin", "name email")
            .sort({ created_at: -1 });
    }

    static async getById(group_id) {
        const group = await Groups.findById(group_id).populate("admin", "name email");
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        const members = await GroupMemberRepository.getMembersByGroup(group_id);

        return {
            ...group.toObject(),
            members,
        };
    }

    static async updateGroup(group_id, updateFields = {}) {
        const group = await Groups.findByIdAndUpdate(group_id, updateFields, { new: true })
            .populate("admin", "name email");
        return group;
    }

    static async deleteGroup(group_id) {
        const group = await Groups.findById(group_id);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        await GroupMember.deleteMany({ group_id });

        await Groups.findByIdAndDelete(group_id);
        return true;
    }
}

export default GroupRepository;
