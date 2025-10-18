import express from "express";
import GroupController from "../controllers/group.controller.js";
import GroupMemberRepository from "../repositories/groupMember.repository.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/requireAdmin.middleware.js";

const group_router = express.Router();

group_router.use(authMiddleware);

group_router.post("/", GroupController.createGroup);
group_router.get("/", GroupController.getAll);
group_router.get("/:id", GroupController.getById);
group_router.put("/:id", requireAdmin, GroupController.updateGroup);
group_router.delete("/:id", requireAdmin, GroupController.deleteGroup);

group_router.get("/user/:userId", async (req, res) => {
    try {
        const groups = await GroupMemberRepository.getGroupsByUser(req.params.userId);
        res.json({ ok: true, data: groups });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
});

export default group_router;
