import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import PresenceController from "../controllers/presence.controller.js";

const router = express.Router();

router.post("/logout", authMiddleware.optional, PresenceController.logout);

router.use(authMiddleware);

router.post("/ping", PresenceController.ping);
router.get("/:user_id", PresenceController.getOne);

export default router;
