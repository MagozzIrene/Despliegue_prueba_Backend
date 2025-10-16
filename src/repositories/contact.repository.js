/* import Contacts from "../models/Contact.model.js";

class ContactRepository {
    static async createContact(requester_id, receiver_id) {
        // Evita duplicados
        const existing = await Contacts.findOne({ requester_id, receiver_id });
        if (existing) return existing;

        const contact = await Contacts.create({
            requester_id,
            receiver_id,
            status: "pendiente",
        });
        return contact;
    }

    static async getContactsByUser(user_id) {
        // Devuelve tanto los enviados como los recibidos
        return await Contacts.find({
            $or: [{ requester_id: user_id }, { receiver_id: user_id }],
        })
            .populate("requester_id", "name email avatar_url status")
            .populate("receiver_id", "name email avatar_url status");
    }

    static async updateStatus(contact_id, new_status) {
        const valid_status = ["pendiente", "aceptado", "rechazado"];
        if (!valid_status.includes(new_status)) throw new Error("Estado inválido");

        const updated = await Contacts.findByIdAndUpdate(
            contact_id,
            { status: new_status },
            { new: true }
        );

        return updated;
    }

    static async deleteContact(contact_id) {
        await Contacts.findByIdAndDelete(contact_id);
        return true;
    }

    static async getPendingRequests(user_id) {
        return await Contacts.find({
            receiver_id: user_id,
            status: "pendiente",
        }).populate("requester_id", "name email avatar_url");
    }
}

export default ContactRepository;
 */

import Contacts from "../models/Contact.model.js";

class ContactRepository {
    static async createContact(requester_id, receiver_id) {
        if (requester_id.toString() === receiver_id.toString()) {
            throw new Error("No puedes enviarte una solicitud de contacto a ti mismo");
        }

        const existing = await Contacts.findOne({
            $or: [
                { requester_id, receiver_id },
                { requester_id: receiver_id, receiver_id: requester_id }
            ]
        });

        if (existing) {
            throw new Error("Ya existe una solicitud de contacto entre estos usuarios");
        }

        const contact = await Contacts.create({
            requester_id,
            receiver_id,
            status: "pendiente",
        });

        return contact;
    }

    static async getContactsByUser(user_id, status = null) {
        const query = {
            $or: [{ requester_id: user_id }, { receiver_id: user_id }]
        };

        if (status) {
            query.status = status;
        }

        return await Contacts.find(query)
            .populate("requester_id", "name email avatar status")
            .populate("receiver_id", "name email avatar status");
    }

    static async updateStatus(contact_id, new_status) {
        const valid_status = ["pendiente", "aceptado", "rechazado"];
        if (!valid_status.includes(new_status)) {
            throw new Error("Estado inválido. Use: pendiente, aceptado o rechazado");
        }

        const updated = await Contacts.findByIdAndUpdate(
            contact_id,
            { status: new_status },
            { new: true }
        ).populate("requester_id", "name email avatar status")
            .populate("receiver_id", "name email avatar status");

        return updated;
    }

    static async deleteContact(contact_id) {
        await Contacts.findByIdAndDelete(contact_id);
        return true;
    }

    static async getPendingRequests(user_id) {
        return await Contacts.find({
            receiver_id: user_id,
            status: "pendiente",
        }).populate("requester_id", "name email avatar status");
    }

    static async getAcceptedContacts(user_id) {
        return await this.getContactsByUser(user_id, "aceptado");
    }
}

export default ContactRepository;