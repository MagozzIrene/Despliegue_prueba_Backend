import GroupRepository from "../repositories/group.repository.js";
import GroupService from "../services/group.service.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupController {
    static async createGroup(req, res) {
        try {
            const { name, description, members = [] } = req.body;
            const admin = req.user.id;

            if (!name)
                throw new ServerError(400, "El nombre del grupo es obligatorio");
            const group = await GroupService.createGroup({ name, description, admin, members });

            const fullGroup = await (await import("../models/Group.model.js")).default
                .findById(group._id)
                .lean();

            res.status(201).json({
                ok: true,
                message: "Grupo creado exitosamente",
                data: fullGroup
            });
        } catch (error) {
            res
                .status(error.status || 500)
                .json({
                    ok: false,
                    message: error.message
                });
        }
    }

    static async getAll(req, res) {
        try {
            const groups = await GroupRepository.getAll();
            res.json({
                ok: true,
                data: groups
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const group = await GroupRepository.getById(id);
            res.json({
                ok: true,
                data: group
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async updateGroup(req, res) {
        try {
            const { id } = req.params;
            const updated = await GroupRepository.updateGroup(id, req.body);
            res.json({
                ok: true,
                message: "Grupo actualizado",
                data: updated
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async deleteGroup(req, res) {
        try {
            const { id } = req.params;
            const group = await GroupRepository.getById(id);
            await GroupRepository.deleteGroup(id);
            res.json({
                ok: true,
                message: `Grupo "${group.name}" eliminado correctamente`
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async toggleActive(req, res) {
        try {
            const { group_id } = req.params;
            const { active } = req.body;

            if (typeof active !== "boolean") {
                throw new ServerError(400, "El campo 'active' debe ser true o false");
            }

            const exists = await GroupRepository.getById(group_id);
            if (!exists) throw new ServerError(404, "Grupo no encontrado");

            const updated = await GroupRepository.updateGroup(group_id, { active });
            if (!updated) throw new ServerError(404, "Error al actualizar el estado del grupo");

            return res.status(200).json({
                ok: true,
                message: `El grupo fue ${active ? "activado" : "desactivado"} correctamente.`,
                data: { id: updated._id, active: updated.active },
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error al cambiar el estado del grupo",
            });
        }
    }
}

export default GroupController;
