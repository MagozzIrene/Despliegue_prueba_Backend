import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectMongoDB from "./config/mongoDB.config.js";
import auth_router from "./routes/auth.router.js";
import contact_router from "./routes/contact.routes.js";
import group_router from "./routes/group.routes.js";
import groupMember_router from "./routes/groupMember.routes.js";
import message_router from "./routes/message.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import groupMessage_router from "./routes/groupMessage.routes.js";
import groupInvite_router from "./routes/groupInvite.routes.js";
import user_router from "./routes/user.routes.js";
import presence_router from "./routes/presence.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "https://despliegue-prueba-frontend.vercel.app",
    "https://despliegue-prueba-backend.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS no permitido para este origen: " + origin));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongoDB();

app.use("/api/auth", auth_router);

app.use("/api/presence", presence_router);

app.use("/api/users", user_router);
app.use("/api/contacts", contact_router);
app.use("/api/groups", group_router);
app.use("/api/group-invites", groupInvite_router);
app.use("/api/group-members", groupMember_router);
app.use("/api/messages", message_router);
app.use("/api/group-messages", groupMessage_router);

app.get("/ruta-protegida", authMiddleware, (req, res) => {
    console.log(req.user);
    res.json({ 
        ok: true, 
        user: req.user 
    });
});

export default app;

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}
