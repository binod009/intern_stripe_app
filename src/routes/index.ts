import express from "express";
import stripe_route from "./stripe.routes";
import stripe from "../config/stripe";
import { handleStripeWebhook } from "../controllers/stripe.controller";
const router = express.Router();

router.use("/stripe", stripe_route);

export default router;
