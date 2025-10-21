import ContactRepository from "../repositories/contact.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class ContactController {

    static async createContact(req, res) {
        try {
            const { requester_id, receiver_id } = req.body;

            if (!requester_id || !receiver_id) {
                throw new ServerError(400, "Faltan datos requeridos");
            }

            const contact = await ContactRepository.createContact(
                requester_id,
                receiver_id
            );

            res.status(201).json({
                ok: true,
                message: "Solicitud de contacto enviada correctamente",
                data: contact,
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async getContacts(req, res) {
        try {
            const { user_id } = req.params;

            const contacts = await ContactRepository.getContactsByUser(user_id);

            res.status(200).json({
                ok: true,
                data: contacts,
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async updateStatus(req, res) {
        try {
            const { contact_id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;

            const updated = await ContactRepository.updateStatus(contact_id, status, userId);

            res.status(200).json({
                ok: true,
                message: "Estado actualizado correctamente",
                data: updated,
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async getPendingRequests(req, res) {
        try {
            const { user_id } = req.params;

            const pending = await ContactRepository.getPendingRequests(user_id);

            res.status(200).json({
                ok: true,
                data: pending,
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async deleteContact(req, res) {
        try {
            const { contact_id } = req.params;

            await ContactRepository.deleteContact(contact_id);

            res.status(200).json({
                ok: true,
                message: "Contacto eliminado correctamente",
            });
        } catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ ok: false, message: error.message });
        }
    }

    static async getAcceptedContacts(req, res) {
        try {
            const { user_id } = req.params;
            const contacts = await ContactRepository.getAcceptedContacts(user_id);

            res.status(200).json({
                ok: true,
                data: contacts,
            });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }

}



export default ContactController;
