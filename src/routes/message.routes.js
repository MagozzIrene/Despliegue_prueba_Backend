import express from "express";
import MessageController from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const message_router = express.Router();

message_router.use(authMiddleware);

message_router.post("/", MessageController.create);
message_router.get("/:userId1/:userId2", MessageController.getConversation);
message_router.delete("/:messageId", MessageController.delete);

message_router.patch("/:messageId/read", MessageController.markAsRead);

export default message_router;
