import mongoose from "mongoose";
import GroupRepository from "../repositories/group.repository.js";
import { ServerError } from "../utils/customError.utils.js";

const requireAdmin = async (req, res, next) => {
    try {
        const groupId = 
            req.params.group_id ||
            req.params.id ||
            req.body.group_id ||
            req.query.group_id;

        const userId = req.user?.id?.toString();

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            throw new ServerError(400, "ID de grupo inválido o ausente");
        }
        if (!userId) {
            throw new ServerError(401, "No se pudo verificar el usuario autenticado");
        }

        const group = await GroupRepository.getById(groupId);
        if (!group) throw new ServerError(404, "Grupo no encontrado");

        const adminId = group.admin?._id?.toString() || group.admin?.toString();

        if (adminId !== userId) {
            throw new ServerError(403, "Solo el admin del grupo puede realizar esta acción");
        }

        next();
    } catch (err) {
        res.status(err.status || 500).json({
            ok: false,
            message: err.message || "Error interno en validación de administrador",
        });
    }
};

export default requireAdmin;