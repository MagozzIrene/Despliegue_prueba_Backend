import express from "express";
import MessageController from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", MessageController.create);
router.get("/:userId1/:userId2", MessageController.getConversation);
router.delete("/:messageId", MessageController.delete);

// Prueba

router.patch("/:messageId/read", MessageController.markAsRead);

export default router;
