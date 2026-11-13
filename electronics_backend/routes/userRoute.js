import { validateUser } from "../middleware/validate.js";
import { register,login } from "../controllers/userController.js";
import express from "express";
const router = express.Router();
router.post("/register", validateUser(true), register);
router.post("/login", validateUser(false), login);
export default router;
