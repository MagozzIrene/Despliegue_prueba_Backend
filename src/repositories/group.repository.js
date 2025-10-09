import Groups from "../models/Group.model.js";
import GroupMemberRepository from "./groupMember.repository.js";

class GroupRepository {
    static async createGroup(name, description, admin) {
        const group = await Groups.create({
            name,
            description,
            admin,
        });

        await GroupMemberRepository.addMember(group._id, admin);

        return group.populate("admin", "name email");
    }

    static async getAll() {
        return await Groups.find()
            .populate("admin", "name email")
            .sort({ created_at: -1 });
    }

    static async getById(group_id) {
        return await Groups.findById(group_id)
            .populate("admin", "name email");
    }

    static async updateGroup(group_id, updateFields = {}) {
        const group = await Groups.findByIdAndUpdate(group_id, updateFields, { new: true })
            .populate("admin", "name email");
        return group;
    }

    static async deleteGroup(group_id) {
        await Groups.findByIdAndDelete(group_id);
        return true;
    }
}

export default GroupRepository;
