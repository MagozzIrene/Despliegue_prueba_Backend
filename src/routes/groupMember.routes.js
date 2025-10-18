import express from "express";
import GroupMemberController from "../controllers/groupMember.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/requireAdmin.middleware.js";

const groupMember_router = express.Router();

groupMember_router.use(authMiddleware);

groupMember_router.post("/", requireAdmin, GroupMemberController.addMember);
groupMember_router.delete("/", requireAdmin, GroupMemberController.removeMember);
groupMember_router.get("/:group_id", GroupMemberController.getMembers);
groupMember_router.get("/user/:user_id", GroupMemberController.getGroupsByUser);
groupMember_router.put("/sync", GroupMemberController.syncMembers);

export default groupMember_router
