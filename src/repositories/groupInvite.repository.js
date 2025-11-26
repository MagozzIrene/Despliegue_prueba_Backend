import jwt from "jsonwebtoken";
import ENVIRONMENT from "../config/environment.config.js";
import GroupInvite from "../models/GroupInvite.model.js";
import transporter from "../config/mailer.config.js";
import { ServerError } from "../utils/customError.utils.js";

class GroupInviteRepository {

    static async createInvite(group_id, sender_id, receiver_email) {
        const token = jwt.sign(
            { group_id, receiver_email },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const invite = await GroupInvite.create({
            group_id,
            sender_id,
            receiver_email,
            token,
        });

        const acceptLink = `${ENVIRONMENT.BACKEND_URL}/api/group-invites/accept/${token}`;
        const rejectLink = `${ENVIRONMENT.BACKEND_URL}/api/group-invites/reject/${token}`;

        await transporter.sendMail({
            from: ENVIRONMENT.GMAIL_USER,
            to: receiver_email,
            subject: "📩 Invitación a un grupo en WhatsApp Clone",
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #161616; padding: 20px;">
            <div style="max-width: 500px; background: #1f1f1f; margin: auto; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #333;">
                <h2 style="color: #2a7b6f;">Invitación a un grupo 💬</h2>
                <p style="color: #eaeaea;">Has sido invitado a unirte a un grupo en <strong>WhatsApp Clone</strong>.</p>
                <a href="${acceptLink}" style="display:inline-block;background: #128C7E;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Aceptar</a>
                <a href="${rejectLink}" style="display:inline-block;background: #d9534f;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Rechazar</a>
            </div>
        </div>`,
        });

        return invite;
    }

    static async acceptInvite(token) {
        const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY);
        const invite = await GroupInvite.findOne({ token, status: "pendiente" });
        if (!invite) throw new ServerError(400, "Invitación no válida o ya usada");

        const UserRepository = (await import("./user.repository.js")).default;
        const existingUser = await UserRepository.getByEmail(decoded.receiver_email);

        if (!existingUser) {
            return `
        <html>
            <body style="font-family:sans-serif;text-align:center;padding:50px;background: #161616;color: #eaeaea;">
                <div style="background: #1f1f1f;color: #eaeaea;;padding:40px;border-radius:16px;display:inline-block; 1px solid #333;">
                <h2 style="color: #eaeaea;>🔑 Crea tu cuenta para unirte al grupo</h2>
                <p style="color: #eaeaea;>Usá el mismo correo con el que recibiste esta invitación:</p>
                <a href="${ENVIRONMENT.FRONTEND_URL}/register?invite=${token}"
                    style="display:inline-block;background: #2a7b6f;color: #eaeaea;padding:12px 20px;border-radius:6px;text-decoration:none;">
                    Crear cuenta y unirme
                </a>
                </div>
            </body>
        </html>`;
        }

        invite.status = "aceptado";
        await invite.save();

        const GroupMemberRepository = (await import("./groupMember.repository.js")).default;
        const GroupRepository = (await import("./group.repository.js")).default;
        const ContactRepository = (await import("./contact.repository.js")).default;

        await GroupMemberRepository.addMember(invite.group_id, existingUser._id);

        const group = await GroupRepository.getById(invite.group_id);
        const admin_id = group.admin._id || group.admin;

        await ContactRepository.createContactIfNotExists(admin_id, existingUser._id);

        return `
        <html>
            <body style="font-family:sans-serif;text-align:center;padding:50px;background: #161616;color: #eaeaea;">
            <div style="background: #1f1f1f;color: #eaeaea;padding:40px;border-radius:16px;display:inline-block; border: 1px solid #333;">
                <h1>🎉 ¡Te uniste al grupo con éxito!</h1>
                <p>Ahora formás parte del grupo al que fuiste invitado.</p>
                <a href="${ENVIRONMENT.FRONTEND_URL || "#"}"
                style="display:inline-block;margin-top:20px;padding:10px 20px;background: #2a7b6f;color: #eaeaea;text-decoration:none;border-radius:8px;">
                Ir al grupo
                </a>
            </div>
            </body>
        </html>`;
    }

    static async rejectInvite(token) {
        const invite = await GroupInvite.findOne({ token, status: "pendiente" });
        if (!invite) throw new ServerError(400, "Invitación no válida o ya usada");

        invite.status = "rechazado";
        await invite.save();

        return `
    <html>
        <body style="font-family:sans-serif;text-align:center;padding:50px;background: #d9534f;color:white;">
            <div style="background:white;color:#333;padding:40px;border-radius:16px;display:inline-block;">
            <h1>❌ Invitación rechazada</h1>
            <p>Has rechazado la invitación al grupo. No se realizará ninguna acción.</p>
            <a href="${ENVIRONMENT.FRONTEND_URL || "#"}"
                style="display:inline-block;margin-top:20px;padding:10px 20px;background:#d9534f;color:white;text-decoration:none;border-radius:8px;">
                Volver al inicio
            </a>
            </div>
        </body>
    </html>`;
    }

    static async markAcceptedByToken(token) {
        const invite = await GroupInvite.findOne({ token, status: "pendiente" });
        if (!invite) throw new ServerError(400, "Invitación no válida o ya usada");
        invite.status = "aceptado";
        await invite.save();
        return invite;
    }

    static async markDeclinedByToken(token) {
        const invite = await GroupInvite.findOne({ token, status: "pendiente" });
        if (!invite) throw new ServerError(400, "Invitación no válida o ya usada");
        invite.status = "rechazado";
        await invite.save();
        return invite;
    }
}

export default GroupInviteRepository;
