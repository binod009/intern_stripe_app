import { Router } from "express";
import {
  createCheckoutController,
  createStripeCustomer,
  createStripeProductController,
  createStripeSubscription,
  DeleteCustomerController,
  getStripCustomerDetails,
  getStripePaymentController,
  getUserInvoicesController,
  handleStripeWebhook,
  stripePaymentController,
  updateStripeCustomer,
  updateSubscriptionController,
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
stripe_route.post(
  "/create/subscription",
  authMiddleware,
  createStripeSubscription
);
stripe_route.post("/create/checkout", createCheckoutController);
stripe_route.get(
  "/payment-details/",
  authMiddleware,
  getStripePaymentController
);
stripe_route.patch(
  "/subscription/update-status",
  authMiddleware,
  updateSubscriptionController
);
stripe_route.get("/invoice", getUserInvoicesController);

export default stripe_route;
