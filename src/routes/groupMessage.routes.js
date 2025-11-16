import express from "express";
import GroupMessageController from "../controllers/groupMessage.controller.js";
import isGroupMemberMiddleware from "../middleware/groupMember.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const groupMessage_router = express.Router();

groupMessage_router.use(authMiddleware);

groupMessage_router.post("/", isGroupMemberMiddleware, GroupMessageController.sendMessage);
groupMessage_router.get("/:group_id", isGroupMemberMiddleware, GroupMessageController.getMessages);
groupMessage_router.patch("/read/:message_id", isGroupMemberMiddleware, GroupMessageController.markAsRead);
groupMessage_router.delete("/:message_id", isGroupMemberMiddleware, GroupMessageController.deleteMessage);

export default groupMessage_router;
