import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongoDB.config.js";


connectMongoDB()

import express from 'express'
import auth_router from "./routes/auth.router.js";
import cors from 'cors'
import authMiddleware from "./middleware/auth.middleware.js";
import contactRoutes from "./routes/contact.routes.js";
import groupRoutes from "./routes/group.routes.js";
import groupMemberRoutes from "./routes/groupMember.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express()

app.use(cors())
app.use(express.json())


app.use('/api/auth', auth_router)
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-members", groupMemberRoutes);
app.use("/api/messages", messageRoutes);


app.get('/ruta-protegida', authMiddleware, (request, response) => {
    console.log(request.user)
    response.send({
        ok: true
    })
})



app.listen(
    8080, 
    () => {
        console.log("Esto esta funcionado")
    }
)
