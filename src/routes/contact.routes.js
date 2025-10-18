import express from "express";
import ContactController from "../controllers/contact.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const contact_router = express.Router();

contact_router.use(authMiddleware);

contact_router.post("/", ContactController.createContact);
contact_router.get("/:user_id", ContactController.getContacts);
contact_router.get("/:user_id/pending", ContactController.getPendingRequests);
contact_router.get("/:user_id/accepted", ContactController.getAcceptedContacts);
contact_router.put("/:contact_id", ContactController.updateStatus);
contact_router.delete("/:contact_id", ContactController.deleteContact);

export default contact_router;
