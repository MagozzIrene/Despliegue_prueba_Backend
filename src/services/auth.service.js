import transporter from "../config/mailer.config.js";
import UserRepository from "../repositories/user.repository.js";
import { ServerError } from "../utils/customError.utils.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ENVIRONMENT from "../config/environment.config.js";

class AuthService {
    static async register(username, password, email) {
        //Verificar que el usuario no este repido
        //  - .getByEmail en UserRepository

        const user_found = await UserRepository.getByEmail(email);
        if (user_found) {
            throw new ServerError(400, "Email ya en uso");
        }

        //Encriptar la contraseña
        const password_hashed = await bcrypt.hash(password, 12);

        //guardarlo en la DB
        const user_created = await UserRepository.createUser(
            username,
            email,
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
                        <a href='${process.env.BACKEND_URL}/api/auth/verify-email/${verification_token}'"
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

        return {
            authorization_token,
        };
    }
}

export default AuthService;
