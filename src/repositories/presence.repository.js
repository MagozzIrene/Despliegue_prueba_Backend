import mongoose from "mongoose";
import Users from "../models/User.model.js";
import { ServerError } from "../utils/customError.utils.js";

class PresenceRepository {
    static async update(userId, patch) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ServerError(400, "ID inválido");
        }
        return Users.findByIdAndUpdate(
            userId,
            patch,
            { new: true, select: "is_online last_seen last_ping" }
        );
    }

    static async get(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ServerError(400, "ID inválido");
        }

        return Users.findById(userId).select("is_online last_seen last_ping created_at");
    }
}

export default PresenceRepository;
