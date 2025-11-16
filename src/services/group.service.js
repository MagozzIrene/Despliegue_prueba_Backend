import GroupRepository from "../repositories/group.repository.js";
import GroupMemberRepository from "../repositories/groupMember.repository.js";
import GroupInviteRepository from "../repositories/groupInvite.repository.js";
import ContactRepository from "../repositories/contact.repository.js";
import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "../utils/customError.utils.js";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "../config/environment.config.js";

class GroupService {

    static async createGroup({ name, description, admin, members = [] }) {
        const group = await GroupRepository.createOnly(name, description, admin);

        await GroupMemberRepository.addMember(group._id, admin);

        if (members.length) {
            await GroupMemberRepository.syncMembers(group._id, members);
        }
        return group;
    }

    static async sendInvite({ group_id, sender_id, receiver_email }) {
        return GroupInviteRepository.createInvite(group_id, sender_id, receiver_email);
    }

    static async acceptInvite({ token, currentUserId = null }) {

        const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY);
        const { group_id, receiver_email } = decoded;

        const invited = await UserRepository.getByEmail(receiver_email);
        if (!invited) {

            return { needsSignup: true, email: receiver_email };
        }

        if (currentUserId) {
            const me = await UserRepository.getById(currentUserId);
            if (!me || me.email.toLowerCase() !== receiver_email.toLowerCase()) {
                throw new ServerError(403, "This invite is not for your account.");
            }
        }

        await GroupInviteRepository.markAcceptedByToken(token);

        const already = await GroupMemberRepository.isMember(group_id, invited._id);
        if (!already) {
            await GroupMemberRepository.addMember(group_id, invited._id);
        }

        const group = await GroupRepository.getById(group_id);
        const admin_id = group.admin._id || group.admin;
        await ContactRepository.createContactIfNotExists(admin_id, invited._id);

        return { group_id, user_id: invited._id };
    }

    static async declineInvite({ token, currentUserId = null }) {
        await GroupInviteRepository.markDeclinedByToken(token);
        return { declined: true };
    }
}

export default GroupService;
