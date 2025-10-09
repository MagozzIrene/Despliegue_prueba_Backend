import express from "express";
import ContactController from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", ContactController.createContact);
router.get("/:user_id", ContactController.getContacts);
router.get("/:user_id/pending", ContactController.getPendingRequests);
router.get("/:user_id/accepted", ContactController.getAcceptedContacts);
router.put("/:contact_id", ContactController.updateStatus);
router.delete("/:contact_id", ContactController.deleteContact);

export default router;
