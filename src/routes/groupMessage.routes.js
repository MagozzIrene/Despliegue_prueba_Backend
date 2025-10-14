import express from "express";
import GroupMessageController from "../controllers/groupMessage.controller.js";

const router = express.Router();

router.post("/", GroupMessageController.sendMessage);
router.get("/:group_id", GroupMessageController.getMessages);
router.patch("/read", GroupMessageController.markAsRead);
router.delete("/:message_id", GroupMessageController.deleteMessage);

export default router;
