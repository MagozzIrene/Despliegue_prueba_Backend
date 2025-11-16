import User from "../models/User.model.js";
import { ServerError } from "../utils/customError.utils.js";

class UserController {
    static async getUserByEmail(req, res, next) {
        try {
            const { email } = req.query;
            if (!email) throw new ServerError(400, "Falta el email");

            const user = await User.findOne({ email }).select("_id name email avatar");
            if (!user) throw new ServerError(404, "Usuario no encontrado");

            res.status(200).json({ ok: true, data: user });
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
