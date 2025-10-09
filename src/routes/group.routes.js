import express from "express";
import GroupController from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", GroupController.createGroup);
router.get("/", GroupController.getAll);
router.get("/:id", GroupController.getById);
router.put("/:id", GroupController.updateGroup);
router.delete("/:id", GroupController.deleteGroup);

export default router;
