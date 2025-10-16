import transporter from "../config/mailer.config.js";
import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "../utils/customError.utils.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ENVIRONMENT from "../config/environment.config.js";

class AuthService {
    static async register(name, password, email) {
        //Verificar que el usuario no este repido
        //  - .getByEmail en UserRepository

        const user_found = await UserRepository.getByEmail(email);
        if (user_found) {
            throw new ServerError(400, "Email ya en uso");
        }


        const defaultAvatar = `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(name)}&radius=50&size=70`;

        //Encriptar la contraseña
        const password_hashed = await bcrypt.hash(password, 12);

        //guardarlo en la DB
        const user_created = await UserRepository.createUser(
            name,
            email,
            defaultAvatar,
            password_hashed
        );
        const verification_token = jwt.sign(
            {
                email: email,
                user_id: user_created._id,
            },
            ENVIRONMENT.JWT_SECRET_KEY
        );
        //Enviar un mail de verificacion
        await transporter.sendMail({
            from: "irenebackend@gmail.com",
            to: email,
            subject: "Verificacion de correo electronico",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 500px; background: white; margin: auto; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #128C7E; margin-bottom: 10px;">¡Bienvenida/o a WhatsApp Clone! 💬</h2>
                        <p style="color: #555;">Gracias por registrarte. Para activar tu cuenta, hacé clic en el botón de abajo:</p>
                        <a href='${process.env.BACKEND_URL}/api/auth/verify-email/${verification_token}'
                        style="display: inline-block; background-color: #128C7E; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                        Verificar mi cuenta
                        </a>
                        <p style="color: #888; font-size: 12px; margin-top: 20px;">
                        Si no creaste esta cuenta, podés ignorar este mensaje.
                        </p>
                    </div>
                </div>
                `,
        });
    }

    static async verifyEmail(verification_token) {
        try {
            const payload = jwt.verify(
                verification_token,
                ENVIRONMENT.JWT_SECRET_KEY
            );

            await UserRepository.updateById(payload.user_id, {
                verified_email: true,
            });

            return;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ServerError(400, "Token invalido");
            }
            throw error;
        }
    }


    static async sendPasswordRecovery(email) {
        // usamos UserRepository en lugar de User directamente
        const user = await UserRepository.getByEmail(email);
        if (!user) return; // No revelamos si existe o no

        // Creamos el token que expira en 15 minutos
        const token = jwt.sign(
            { id: user._id },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: "15m" }
        );

        // Link para resetear la contraseña
        const resetLink = `${ENVIRONMENT.BACKEND_URL}/api/auth/reset-password/${token}`;

        // Contenido del mail
        const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 500px; background: white; margin: auto; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #128C7E;">Recuperación de contraseña 🔑</h2>
                <p style="color: #555;">Hola ${user.name || "usuario"},</p>
                <p style="color: #555;">Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Podés hacerlo haciendo clic en el botón de abajo:</p>
                <a href="${resetLink}"
                    style="display:inline-block;background-color:#128C7E;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:20px;">
                    Restablecer contraseña
                </a>
                <p style="color:#888;font-size:12px;margin-top:20px;">
                    Si no realizaste esta solicitud, ignorá este correo.
                </p>
            </div>
        </div>
    `;

        // Enviar el correo
        await transporter.sendMail({
            from: ENVIRONMENT.GMAIL_USER,
            to: user.email,
            subject: "Recuperación de contraseña",
            html,
        });
    }


    static async login(email, password) {
        /* 
            - Buscar por email y guardar en una variable
                - No se encontro: Tiramos error 404 'Email no registrado' / 'El email o la contraseña son invalidos'
            - Usamos bcrypt.compare para checkear que la password recibida sea igual al hash guardado en DB
                - En caso de que no sean iguales: 401 (Unauthorized) 'Contraseña invalida' / 'El email o la contraseña son invalidos'
            - Generar el authorization_token con los datos que coinsideremos importantes para una sesion: (name, email, rol, created_at) (NO PASAR DATOS SENSIBLES)
            - Retornar el token
            */

        const user = await UserRepository.getByEmail(email);
        if (!user) {
            throw new ServerError(404, "Email no registrado");
        }

        if (user.verified_email === false) {
            throw new ServerError(401, "Email no verificado");
        }

        /* Permite saber si cierto valor es igual a otro cierto valor encriptado */
        const is_same_password = await bcrypt.compare(password, user.password);
        if (!is_same_password) {
            throw new ServerError(401, "Contraseña incorrecta");
        }
        const authorization_token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            {
                expiresIn: "7d",
            }
        );

        /* return {
            authorization_token,
        }; */
        return {
            authorization_token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        };
    }


    /* static async resetPassword(token, new_password) {
    try {
        console.log("Token recibido:", token);

        const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY);
        const user_id = decoded.id;
        console.log("ID del usuario:", user_id);

        const hashedPassword = await bcrypt.hash(new_password, 12);

        const userUpdated = await UserRepository.updateById(user_id, { password: hashedPassword });

        if (!userUpdated) {
            throw new ServerError(404, "Usuario no encontrado");
        }

        console.log("Contraseña actualizada correctamente");
        return true;
    } catch (error) {
        console.error("Error en resetPassword:", error);
        throw new ServerError(500, "Error al actualizar contraseña");
    }
} */

    static async resetPassword(token, new_password) {
        try {
            console.log("resetPassword iniciado");
            console.log("Token recibido:", token);
            console.log("Nueva contraseña recibida:", new_password);

            const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET_KEY);
            console.log("Token decodificado:", decoded);

            const user_id = decoded.id;
            console.log("ID del usuario:", user_id);

            const hashedPassword = await bcrypt.hash(new_password, 12);
            console.log("Contraseña encriptada:", hashedPassword ? "ok" : "fail");

            const userUpdated = await UserRepository.updateById(user_id, { password: hashedPassword });
            console.log("Resultado de update:", userUpdated);

            if (!userUpdated) {
                throw new ServerError(404, "Usuario no encontrado");
            }

            console.log("Contraseña actualizada correctamente");
            return true;

        } catch (error) {
            console.error("ERROR en resetPassword (producción):", error);
            throw new ServerError(500, "Error al actualizar contraseña");
        }
    }

}

export default AuthService;
