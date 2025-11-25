import ENVIRONMENT from "../config/environment.config.js"
import AuthService from "../services/auth.service.js"
import { ServerError } from "../utils/customError.utils.js"

class AuthController {
    static async register(request, response) {
        try {

            const {
                name,
                email,
                password
            } = request.body
            console.log(request.body)
            if (!name) {
                throw new ServerError(
                    400,
                    'Debes enviar un nombre de usuario valido'
                )
            }
            else if (!email || !String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new ServerError(
                    400,
                    'Debes enviar un email valido'
                )
            }
            else if (!password || password.length < 8) {
                throw new ServerError(
                    400,
                    'Debes enviar una contraseña valida'
                )
            }
            await AuthService.register(name, password, email)

            response.json({
                ok: true,
                status: 200,
                message: 'Usuario registrado correctamente. Verificá tu correo electrónico'
            })
        }
        catch (error) {
            console.log(error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }

    }
    static async login(request, response) {
        try {
            const { email, password } = request.body

            const { authorization_token, user } = await AuthService.login(email, password)
            return response.json({
                ok: true,
                message: 'Logueado con exito',
                status: 200,
                data: {
                    authorization_token: authorization_token,
                    user: user
                }
            })
        }
        catch (error) {
            console.log(error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }
    static async verifyEmail(request, response) {
        try {
            const { verification_token } = request.params
            await AuthService.verifyEmail(verification_token)

            return response.status(200).send(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Cuenta verificada</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: #161616;
                            color: #dbdbdb;
                            text-align: center;
                            padding: 50px;
                        }
                        .card {
                            background: #1f1f1f;
                            color: #dbdbdb;
                            border-radius: 16px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            display: inline-block;
                            padding: 40px 60px;
                            border: 1px solid #333;
                        }
                        h1 {
                            color: #2a7b6f;
                        }
                        a {
                            display: inline-block;
                            margin-top: 20px;
                            padding: 10px 20px;
                            background: #2a7b6f;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                        }
                        a:hover {
                            background: #009e8c;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>¡Tu cuenta fue verificada con éxito!</h1>
                        <p>Ya podés iniciar sesión.</p>
                        <a href="${ENVIRONMENT.FRONTEND_URL || '#'}">Ir al login</a>
                    </div>
                </body>
            </html>
        `)
        }
        catch (error) {
            console.log(error)
            if (error.status) {
                return response.status(error.status).json(
                    {
                        ok: false,
                        status: error.status,
                        message: error.message
                    }
                )
            }
            else {
                return response.status(500).json(
                    {
                        ok: false,
                        status: 500,
                        message: 'Error interno del servidor'
                    }
                )
            }
        }
    }
    static async recoverPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ 
                ok: false, 
                message: "Falta el email." 
            });

            await AuthService.sendPasswordRecovery(email);
            res.status(200).json({ 
                ok: true, 
                message: "Correo de recuperación enviado (si el usuario existe)." });
        } catch (error) {
            res.status(500).json({ 
                ok: false, 
                message: error.message 
            });
        }
    }
    static async showResetForm(req, res) {
        const { token } = req.params;
        return res.send(`
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Restablecer contraseña</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background: #161616;
            color: #eaeaea;
            text-align: center;
            padding: 50px;
        }
        .card {
            background: #1f1f1f;
            color: #eaeaea;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: inline-block;
            padding: 40px 60px;
            border: 1px solid #333;
        }
        input {
            width: 80%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
            background: #242424;
        }
        button {
            background: #2a7b6f;
            color: #eaeaea;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            padding: 10px 20px;
        }
        </style>
    </head>
    <body>
        <div class="card">
        <h1>Restablecer contraseña</h1>
        <form id="resetForm">
            <input type="password" name="new_password" placeholder="Nueva contraseña" required />
            <br />
            <input type="password" name="confirm_password" placeholder="Confirmar contraseña" required />
            <br />
            <button type="submit">Actualizar contraseña</button>
        </form>
        <p id="message" style="color:red;font-weight:bold;"></p>
        </div>

        <script>
        document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const new_password = e.target.new_password.value;
            const confirm_password = e.target.confirm_password.value;

            try {
                const res = await fetch('/api/auth/reset-password/${token}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_password, confirm_password })
                });

                if (res.redirected) {
                    window.location.href = res.url;
                    return;
                }

                const text = await res.text();
                document.getElementById('message').textContent = text;
            } catch (err) {
                document.getElementById('message').textContent = 'Error al conectar con el servidor.';
            }
        });
        </script>
    </body>
    </html>
    `);
    }
    static async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { new_password, confirm_password } = req.body;
            if (!new_password || new_password !== confirm_password) {
                return res.status(400).send("Las contraseñas no coinciden o faltan campos.");
            }

            await AuthService.resetPassword(token, new_password);

            return res.redirect(`${ENVIRONMENT.FRONTEND_URL}/login`);

        } catch (error) {
            console.error("Error completo en resetPassword controller:", error);
            console.error("Stack trace:", error.stack);
            console.error("Body recibido:", req.body);
            console.error("Token recibido:", req.params.token);
            return res.status(500).send("Error al actualizar contraseña.");
        }
    }
}

export default AuthController