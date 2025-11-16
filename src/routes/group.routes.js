import express from "express";
import GroupController from "../controllers/group.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/requireAdmin.middleware.js";
import isGroupMemberMiddleware from "../middleware/groupMember.middleware.js";

const group_router = express.Router();

group_router.use(authMiddleware);

group_router.post("/", GroupController.createGroup);
group_router.get("/", GroupController.getAll);
group_router.get("/:id", isGroupMemberMiddleware,GroupController.getById);
group_router.put("/:id", requireAdmin, GroupController.updateGroup);
group_router.delete("/:id", requireAdmin, GroupController.deleteGroup);
group_router.patch("/:group_id/toggle-active", requireAdmin, GroupController.toggleActive);

export default group_router;
