import express from "express";
import GroupMemberController from "../controllers/groupMember.controller.js";

const router = express.Router();

router.post("/", GroupMemberController.addMember);
router.delete("/", GroupMemberController.removeMember);
router.get("/:group_id", GroupMemberController.getMembers);
router.get("/user/:user_id", GroupMemberController.getGroupsByUser);
router.put("/sync", GroupMemberController.syncMembers);

export default router
