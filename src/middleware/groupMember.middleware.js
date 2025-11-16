import GroupMemberRepository from "../repositories/groupMember.repository.js";
import mongoose from "mongoose";

const isGroupMemberMiddleware = async (req, res, next) => {
    try {
        const groupId =
            req.params.group_id ||
            req.params.id ||
            req.body.group_id ||
            req.query.group_id;
        const userId = req.user.id;

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({
                ok: false,
                message: "ID de grupo inválido o ausente",
            });
        }

        const isMember = await GroupMemberRepository.isMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({
                ok: false,
                message: "No sos miembro de este grupo",
            });
        }

        next();
    } catch (error) {
        console.error("Error en isGroupMemberMiddleware:", error);
        res.status(500).json({
            ok: false,
            message: "Error interno al validar membresía del grupo",
        });
    }
};

export default isGroupMemberMiddleware;
