import ContactRepository from "../repositories/contact.repository.js";
import { ServerError } from "../utils/customError.utils.js";

class ContactService {
    static async sendRequest(requester_id, receiver_id) {
        if (!requester_id || !receiver_id)
            throw new ServerError(400, "Faltan datos requeridos");
        if (String(requester_id) === String(receiver_id))
            throw new ServerError(400, "No puedes enviarte una solicitud a ti mismo");

        return await ContactRepository.createContact(requester_id, receiver_id);
    }

    static async acceptRequest(contact_id, user_id) {
        const contact = await ContactRepository.getById(contact_id);
        if (String(contact.receiver_id._id || contact.receiver_id) !== String(user_id))
            throw new ServerError(403, "No tienes permiso para aceptar esta solicitud");

        return await ContactRepository.updateStatus(contact_id, "aceptado");
    }

    static async rejectRequest(contact_id, user_id) {
        const contact = await ContactRepository.getById(contact_id);
        if (String(contact.receiver_id._id || contact.receiver_id) !== String(user_id))
            throw new ServerError(403, "No tienes permiso para rechazar esta solicitud");

        return await ContactRepository.updateStatus(contact_id, "rechazado");
    }

    static async deleteContact(contact_id, user_id) {
        return await ContactRepository.deleteContact(contact_id, user_id);
    }

    static async getContacts(user_id) {
        return await ContactRepository.getContactsByUser(user_id);
    }

    static async getPending(user_id) {
        return await ContactRepository.getPendingRequests(user_id);
    }

    static async getAccepted(user_id) {
        return await ContactRepository.getAcceptedContacts(user_id);
    }
}

export default ContactService;
