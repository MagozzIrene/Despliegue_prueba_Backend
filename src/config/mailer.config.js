import nodemailer from "nodemailer";
import ENVIRONMENT from "./environment.config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENVIRONMENT.GMAIL_USER,
        pass: ENVIRONMENT.GMAIL_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Error al conectar con Gmail:", error);
    } else {
        console.log("Servidor de correo listo para enviar mensajes");
    }
});

export default transporter;
