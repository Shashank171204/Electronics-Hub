import { auth, requireOrderOwner } from "../middleware/auth.js";
import { validateOrder, validateOrderEmail } from "../middleware/validate.js";
import express from "express";
import { newOrder,showOrder } from "../controllers/orderController.js";

const Router = express.Router();

Router.post("/neworder", auth, validateOrder, requireOrderOwner, newOrder);
Router.get("/showorder/:id", auth, validateOrderEmail, requireOrderOwner, showOrder);

export default Router
