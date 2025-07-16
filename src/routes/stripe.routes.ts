import { Router } from "express";
import {
  createStripeProductController,
  createStripeSubscription,
  stripePaymentController,
} from "../controllers/stripe.controller";

const stripe_route = Router();

stripe_route.post("/create-payment", stripePaymentController);
stripe_route.post("/create/product", createStripeProductController);
stripe_route.post("/create/subscription", createStripeSubscription);

export default stripe_route;
