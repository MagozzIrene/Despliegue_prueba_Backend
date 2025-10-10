import mongoose from "mongoose";

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

const Contacts = mongoose.model("Contact", contactSchema);

export default Contacts;
