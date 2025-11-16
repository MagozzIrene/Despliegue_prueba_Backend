import express from "express";
import GroupInviteController from "../controllers/groupInvite.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/requireAdmin.middleware.js";

const groupInvite_router = express.Router();

groupInvite_router.post("/", authMiddleware, requireAdmin, GroupInviteController.sendInvite);

groupInvite_router.get("/accept/:token", GroupInviteController.acceptInvite);
groupInvite_router.get("/reject/:token", GroupInviteController.rejectInvite);

groupInvite_router.post("/accept/:token", authMiddleware, GroupInviteController.acceptInviteJson);
groupInvite_router.post("/reject/:token", authMiddleware, GroupInviteController.declineInviteJson);

export default groupInvite_router;
