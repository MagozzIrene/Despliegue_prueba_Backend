import ENVIRONMENT from "../config/environment.config.js"
import AuthService from "../services/auth.service.js"
import { ServerError } from "../utils/customError.utils.js"

class AuthController {
    static async register(request, response) {
        try {
            /* 
            Recibiremos un username, email, password
            Validar los 3 campos
            */
            const {
                username, 
                email, 
                password
            } = request.body
            console.log(request.body)
            if(!username){
                throw new ServerError(
                    400, 
                    'Debes enviar un nombre de usuario valido'
                )
            }
            else if(!email || !String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
                throw new ServerError(
                    400, 
                    'Debes enviar un email valido'
                )
            }
            else if(!password || password.length < 8){
                throw new ServerError(
                    400, 
                    'Debes enviar una contraseña valida'
                )
            }
            await AuthService.register(username, password, email)

            response.json({
                ok: true,
                status: 200,
                message: 'Usuario registrado correctamente'
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
        try{
            const {email, password} = request.body

            /* 
            - Validar que el email y password sean validas
            */
            const { authorization_token } = await AuthService.login(email, password)
            return response.json({
                ok: true,
                message: 'Logueado con exito',
                status: 200,
                data: {
                    authorization_token: authorization_token
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
        try{
            const {verification_token} = request.params
            await AuthService.verifyEmail(verification_token)

            /* return response.json({
                ok: true, 
                status: 200,
                message: 'Usuario validado'
            }) */

            return response.status(200).send(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Cuenta verificada</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: #00BFA6;
                            color: white;
                            text-align: center;
                            padding: 50px;
                        }
                        .card {
                            background: white;
                            color: #333;
                            border-radius: 16px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            display: inline-block;
                            padding: 40px 60px;
                        }
                        h1 {
                            color: #00BFA6;
                        }
                        a {
                            display: inline-block;
                            margin-top: 20px;
                            padding: 10px 20px;
                            background: #00BFA6;
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
}



export default AuthController   