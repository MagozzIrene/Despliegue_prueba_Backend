import express from "express";
import GroupMemberController from "../controllers/groupMember.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/requireAdmin.middleware.js";
import isGroupMemberMiddleware from "../middleware/groupMember.middleware.js";

const groupMember_router = express.Router();

groupMember_router.use(authMiddleware);

groupMember_router.post("/", requireAdmin, GroupMemberController.addMember);
groupMember_router.delete("/:group_id/:member_id", requireAdmin, GroupMemberController.removeMember);
groupMember_router.get("/user/me", authMiddleware, GroupMemberController.getGroupsByUser);
groupMember_router.get("/:group_id", isGroupMemberMiddleware, GroupMemberController.getMembers);
groupMember_router.put("/sync", requireAdmin, GroupMemberController.syncMembers);
groupMember_router.patch("/:group_id/:member_id/role", requireAdmin, GroupMemberController.changeRole);

export default groupMember_router;
