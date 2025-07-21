import express, { NextFunction, Request, Response } from "express";
import stripe_route from "./stripe.routes";
import stripe from "../config/stripe";
import { handleStripeWebhook } from "../controllers/stripe.controller";
import refreshTokenController from "../controllers/auth.controller";
const router = express.Router();

router.use("/stripe", stripe_route);
router.use("/token", refreshTokenController);

export default router;
