import express from "express";
import GroupController from "../controllers/group.controller.js";
import GroupMemberRepository from "../repositories/groupMember.repository.js";

const router = express.Router();

router.post("/", GroupController.createGroup);
router.get("/", GroupController.getAll);
router.get("/:id", GroupController.getById);
router.put("/:id", GroupController.updateGroup);
router.delete("/:id", GroupController.deleteGroup);

router.get("/user/:userId", async (req, res) => {
    try {
        const groups = await GroupMemberRepository.getGroupsByUser(req.params.userId);
        res.json({ ok: true, data: groups });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
});

export default router;
