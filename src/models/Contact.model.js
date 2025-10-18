import mongoose from "mongoose";

import Message from "./Message.model.js";

const contactSchema = new mongoose.Schema({
    requester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pendiente", "aceptado", "rechazado"],
        default: "pendiente",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

contactSchema.pre("findOneAndDelete", async function (next) {
    try {
        const contact = await this.model.findOne(this.getQuery());
        if (!contact) return next();

        await Message.deleteMany({
            $or: [
                { sender: contact.requester_id, receiver: contact.receiver_id },
                { sender: contact.receiver_id, receiver: contact.requester_id },
            ],
        });

        console.log(
            `Contacto entre ${contact.requester_id} y ${contact.receiver_id} eliminado junto con sus mensajes.`
        );

        next();
    } catch (error) {
        console.error("Error en eliminación en cascada de contacto:", error);
        next(error);
    }
});

const Contacts = mongoose.model("Contact", contactSchema);

export default Contacts;
