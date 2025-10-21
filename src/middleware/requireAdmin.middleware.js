import GroupRepository from "../repositories/group.repository.js";
import { ServerError } from "../utils/customError.utils.js";

const requireAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.id || req.params.group_id || req.body.group_id;
        if (!groupId) throw new ServerError(400, "Falta el id del grupo");

        const group = await GroupRepository.getById(groupId);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        const adminId = group.admin._id || group.admin;
        if (String(adminId) !== String(req.user.id)) {
            throw new ServerError(403, "Solo el admin del grupo puede realizar esta acción");
        }

        next();
    } catch (err) {
        return res.status(err.status || 500).json({ ok: false, message: err.message || "Error interno" });
    }
};

export default requireAdmin;
