import GroupRepository from "../repositories/group.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupController {
    static async createGroup(req, res) {
        try {
            const { name, description, admin } = req.body;
            if (!name || !admin) throw new ServerError(400, "Nombre y admin son obligatorios");

            const group = await GroupRepository.createGroup(name, description, admin);
            res.status(201).json({ ok: true, data: group });
        } catch (error) {
            res.status(error.statusCode || 500).json({ ok: false, message: error.message });
        }
    }

    static async getAll(req, res) {
        try {
            const groups = await GroupRepository.getAll();
            res.json({ ok: true, data: groups });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const group = await GroupRepository.getById(id);
            res.json({ ok: true, data: group });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async updateGroup(req, res) {
        try {
            const { id } = req.params;
            const updated = await GroupRepository.updateGroup(id, req.body);
            res.json({ ok: true, data: updated });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

    static async deleteGroup(req, res) {
        try {
            const { id } = req.params;
            await GroupRepository.deleteGroup(id);
            res.json({ ok: true, message: "Grupo eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }
}

export default GroupController;
