import express from "express";
import UserController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const user_router = express.Router();

user_router.use(authMiddleware);
user_router.get("/", UserController.getUserByEmail);

export default user_router;
