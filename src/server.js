import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectMongoDB from "./config/mongoDB.config.js";

import auth_router from "./routes/auth.router.js";
import contactRoutes from "./routes/contact.routes.js";
import groupRoutes from "./routes/group.routes.js";
import groupMemberRoutes from "./routes/groupMember.routes.js";
import messageRoutes from "./routes/message.routes.js";
import authMiddleware from "./middleware/auth.middleware.js";
import groupMessageRoutes from "./routes/groupMessage.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "https://despliegue-prueba-frontend.vercel.app"
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

//Prueba

app.use(express.urlencoded({ extended: true }));


connectMongoDB();

app.use("/api/auth", auth_router);
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-members", groupMemberRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/group-messages", groupMessageRoutes);

app.get("/ruta-protegida", authMiddleware, (req, res) => {
    console.log(req.user);
    res.json({ ok: true, user: req.user });
});

export default app;

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}
