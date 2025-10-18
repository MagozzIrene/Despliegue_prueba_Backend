import GroupMemberRepository from "../repositories/groupMember.repository.js";

const isGroupMemberMiddleware = async (req, res, next) => {
    const groupId = req.params.group_id;
    const userId = req.user.id;

    const member = await GroupMemberRepository.findMember(groupId, userId);
    if (!member) {
        return res.status(403).json({
            ok: false,
            message: "No sos miembro de este grupo",
        });
    }

    next();
};

export default isGroupMemberMiddleware