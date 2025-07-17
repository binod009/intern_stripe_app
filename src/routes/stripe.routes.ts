import { Router } from "express";
import {
  createCheckoutController,
  createStripeProductController,
  createStripeSubscription,
  stripePaymentController,
} from "../controllers/stripe.controller";

const stripe_route = Router();

stripe_route.post("/create-payment", stripePaymentController);
stripe_route.post("/create/product", createStripeProductController);
stripe_route.post("/create/subscription", createStripeSubscription);
stripe_route.post("/create/checkout", createCheckoutController);

export default stripe_route;
