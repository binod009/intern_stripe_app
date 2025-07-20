import { Router } from "express";
import {
  createCheckoutController,
  createStripeCustomer,
  createStripeProductController,
  createStripeSubscription,
  DeleteCustomerController,
  getStripCustomerDetails,
  getStripePaymentController,
  handleStripeWebhook,
  stripePaymentController,
  updateStripeCustomer,
} from "../controllers/stripe.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const stripe_route = Router();
stripe_route.post("/webhook", handleStripeWebhook);
stripe_route.patch("/customer/update/:customerId", updateStripeCustomer);
stripe_route.post("/create-user", createStripeCustomer);
stripe_route.patch("/customer/delete/:customerId", DeleteCustomerController);
stripe_route.get("/user/details", getStripCustomerDetails);
stripe_route.post("/create-payment", authMiddleware, stripePaymentController);
stripe_route.post("/create/product", createStripeProductController);
stripe_route.post("/create/subscription", createStripeSubscription);
stripe_route.post("/create/checkout", createCheckoutController);
stripe_route.get(
  "/payment-details/",
  authMiddleware,
  getStripePaymentController
);

export default stripe_route;
