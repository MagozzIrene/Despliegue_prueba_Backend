import ContactService from "../services/contact.service.js";
import { ServerError } from "../utils/customError.utils.js";

class ContactController {
    static async createContact(req, res) {
        try {
            const requester_id = req.user.id || req.user._id;
            const { receiver_id } = req.body;

            if (!receiver_id)
                throw new ServerError(400, "Faltan datos requeridos: receiver_id");

            const contact = await ContactService.sendRequest(requester_id, receiver_id);

            res.status(201).json({
                ok: true,
                message: "Solicitud de contacto enviada correctamente.",
                data: contact,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async getContacts(req, res) {
        try {
            const user_id = req.user.id || req.user._id;
            const contacts = await ContactService.getContacts(user_id);

            res.status(200).json({
                ok: true,
                message: "Lista de contactos obtenida correctamente.",
                data: contacts,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async updateStatus(req, res) {
        try {
            const { contact_id } = req.params;
            const { status } = req.body;
            const userId = req.user.id || req.user._id;

            if (!["aceptado", "rechazado"].includes(status)) {
                throw new ServerError(400, "Estado inválido. Usa 'aceptado' o 'rechazado'.");
            }

            const updated =
                status === "aceptado"
                    ? await ContactService.acceptRequest(contact_id, userId)
                    : await ContactService.rejectRequest(contact_id, userId);

            res.status(200).json({
                ok: true,
                message: `Solicitud de contacto ${status === "aceptado" ? "aceptada" : "rechazada"} correctamente.`,
                data: updated,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async getPendingRequests(req, res) {
        try {
            const user_id = req.user.id || req.user._id;
            const pending = await ContactService.getPending(user_id);

            res.status(200).json({
                ok: true,
                message: "Solicitudes de contacto pendientes obtenidas correctamente.",
                data: pending,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async getAcceptedContacts(req, res) {
        try {
            const user_id = req.user.id || req.user._id;
            const contacts = await ContactService.getAccepted(user_id);

            res.status(200).json({
                ok: true,
                message: "Contactos aceptados obtenidos correctamente.",
                data: contacts,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }

    static async deleteContact(req, res) {
        try {
            const { contact_id } = req.params;
            const userId = req.user.id || req.user._id;

            const deleted = await ContactService.deleteContact(contact_id, userId);

            res.status(200).json({
                ok: true,
                message: "Contacto eliminado correctamente.",
                data: deleted,
            });
        } catch (error) {
            res.status(error.status || 500).json({
                ok: false,
                message: error.message || "Error interno del servidor",
            });
        }
    }
}

export default ContactController;