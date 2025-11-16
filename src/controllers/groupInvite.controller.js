import GroupInviteRepository from "../repositories/groupInvite.repository.js";
import GroupService from "../services/group.service.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupInviteController {

    static async sendInvite(req, res) {
        try {
            const { group_id } = req.body;
            const receiver_email = req.body.receiver_email || req.body.email;
            const sender_id = req.user.id;

            if (!group_id || !receiver_email)
                throw new ServerError(400, "Faltan datos requeridos");

            const invite = await GroupInviteRepository.createInvite(group_id, sender_id, receiver_email);

            res.status(201).json({
                ok: true,
                message: "Invitación enviada correctamente ✉️",
                data: invite,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async acceptInvite(req, res) {
        try {
            const { token } = req.params;
            const html = await GroupInviteRepository.acceptInvite(token);
            res.status(200).send(html);
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async rejectInvite(req, res) {
        try {
            const { token } = req.params;
            const html = await GroupInviteRepository.rejectInvite(token);
            res.status(200).send(html);
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async acceptInviteJson(req, res) {
        try {
            const { token } = req.params;
            const currentUserId = req.user?.id || null;

            const result = await GroupService.acceptInvite({ token, currentUserId });

            if (result.needsSignup) {
                return res.status(409).json({
                    ok: false,
                    message: "El usuario debe registrarse primero con este correo electrónico.",
                    data: { email: result.email },
                });
            }

            return res.json({
                ok: true,
                message: "Invitación aceptada",
                data: result,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async declineInviteJson(req, res) {
        try {
            const { token } = req.params;
            const result = await GroupService.declineInvite({ token });
            return res.json({
                ok: true,
                message: "Invitación rechazada",
                data: result,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }
}

export default GroupInviteController;
