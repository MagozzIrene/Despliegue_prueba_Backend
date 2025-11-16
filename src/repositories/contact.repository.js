import Contacts from "../models/Contact.model.js";
import { ServerError } from "../utils/customError.utils.js";
import mongoose from "mongoose";

class ContactRepository {
    static async createContact(requester_id, receiver_id) {
        const requesterObj = new mongoose.Types.ObjectId(requester_id);
        const receiverObj = new mongoose.Types.ObjectId(receiver_id);

        const existing = await Contacts.findOne({
            $or: [
                { requester_id: requesterObj, receiver_id: receiverObj },
                { requester_id: receiverObj, receiver_id: requesterObj },
            ],
            status: { $in: ["pendiente", "aceptado"] }
        });

        if (existing)
            throw new ServerError(400, "Ya existe una solicitud de contacto entre estos usuarios");

        const contact = await Contacts.create({
            requester_id,
            receiver_id,
            status: "pendiente",
        });

        return await contact.populate([
            { path: "requester_id", select: "name email avatar" },
            { path: "receiver_id", select: "name email avatar" },
        ]);
    }

    static async getById(contact_id) {
        const contact = await Contacts.findById(contact_id)
            .populate("requester_id", "name email avatar")
            .populate("receiver_id", "name email avatar");

        if (!contact) throw new ServerError(404, "Contacto no encontrado");
        return contact;
    }

    static async updateStatus(contact_id, new_status) {
        const valid_status = ["pendiente", "aceptado", "rechazado"];
        if (!valid_status.includes(new_status))
            throw new ServerError(400, "Estado inválido. Use: pendiente, aceptado o rechazado");

        const updated = await Contacts.findByIdAndUpdate(
            contact_id,
            { status: new_status },
            { new: true }
        )
            .populate("requester_id", "name email avatar status")
            .populate("receiver_id", "name email avatar status");

        if (!updated) throw new ServerError(404, "Contacto no encontrado");
        return updated;
    }

    static async deleteContact(contact_id, user_id) {
        const contact = await Contacts.findById(contact_id);
        if (!contact) throw new ServerError(404, "Contacto no encontrado");

        const isAuthorized =
            String(contact.requester_id) === String(user_id) ||
            String(contact.receiver_id) === String(user_id);

        if (!isAuthorized)
            throw new ServerError(403, "No tienes permiso para eliminar este contacto");

        const deleted = await Contacts.findByIdAndDelete(contact_id);
        return await deleted.populate([
            { path: "requester_id", select: "name email avatar" },
            { path: "receiver_id", select: "name email avatar" },
        ]);
    }

    static async getContactsByUser(user_id, status = null) {
        const userObjectId = new mongoose.Types.ObjectId(user_id);
        const query = {
            $or: [{ requester_id: userObjectId }, { receiver_id: userObjectId }],
        };
        if (status) query.status = status;

        return await Contacts.find(query)
            .populate("requester_id", "name email avatar")
            .populate("receiver_id", "name email avatar");
    }

    static async getPendingRequests(user_id) {
        const userObjectId = new mongoose.Types.ObjectId(user_id);

        return await Contacts.find({
            status: "pendiente",
            $or: [
                { receiver_id: userObjectId },
                { requester_id: userObjectId },
            ],
        })
            .populate("requester_id", "name email avatar status")
            .populate("receiver_id", "name email avatar status");
    }


    static async getAcceptedContacts(user_id) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const contacts = await Contacts.find({
                $or: [{ requester_id: userObjectId }, { receiver_id: userObjectId }],
                status: "aceptado",
            })
                .populate("requester_id", "name email avatar")
                .populate("receiver_id", "name email avatar")
                .lean();

            const { default: Message } = await import("../models/Message.model.js");

            const enrichedContacts = await Promise.all(
                contacts.map(async (contact) => {
                    const otherUserId =
                        contact.requester_id._id.toString() === user_id.toString()
                            ? contact.receiver_id._id
                            : contact.requester_id._id;

                    const lastMessage = await Message.findOne({
                        $or: [
                            { sender: user_id, receiver: otherUserId },
                            { sender: otherUserId, receiver: user_id },
                        ],
                    })
                        .sort({ sent_at: -1 })
                        .select("text sent_at")
                        .lean();

                    return {
                        ...contact,
                        last_message: lastMessage?.text || "Sin mensajes aún",
                        last_message_time: lastMessage
                            ? lastMessage.sent_at
                            : null,
                    };
                })
            );

            return enrichedContacts;
        } catch (error) {
            console.error("Error en getAcceptedContacts:", error);
            throw new ServerError(500, "Error al obtener contactos aceptados");
        }
    }



    static async createContactIfNotExists(userA_id, userB_id) {
        const userAObj = new mongoose.Types.ObjectId(userA_id);
        const userBObj = new mongoose.Types.ObjectId(userB_id);

        const existing = await Contacts.findOne({
            $or: [
                { requester_id: userAObj, receiver_id: userBObj },
                { requester_id: userBObj, receiver_id: userAObj },
            ],
        });

        if (existing) return existing;

        return await Contacts.create({
            requester_id: userA_id,
            receiver_id: userB_id,
            status: "aceptado",
        });
    }
}

export default ContactRepository;
