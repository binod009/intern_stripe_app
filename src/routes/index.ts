import express from "express";
import stripe_route from "./stripe.routes";
import stripe from "../config/stripe";
const router = express.Router();

router.use("/stripe", stripe_route);

export default router;
