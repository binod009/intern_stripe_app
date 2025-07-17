import { Express, NextFunction, Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler";
import stripe from "../config/stripe";
import ApiError from "../utils/ApiError";

const stripePaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount, currency } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  }
);

const createStripeProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const { productName, productDescription, amount, currency, interval } =
      req.body;
    const product = await stripe.products.create({
      name: productName,
      description: productDescription,
    });

    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: currency,
      recurring: { interval: interval },
      product: product.id,
    });

    res.status(200).json({
      productId: product.id,
      priceId: price.id,
    });
  }
);

const createStripeSubscription = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, payment_method_id, price_id } = req.body;
    let customers = await stripe.customers.list({ email });
    let customer;
    if (customers.data.length === 0) {
      customer = await stripe.customers.create({
        email,
        payment_method: payment_method_id,
        invoice_settings: { default_payment_method: payment_method_id },
      });
    }
    customer = customers.data[0];
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price_id }],
      expand: ["latest_invoice.payment_intent"],
      payment_behavior: "default_incomplete",
      collection_method: "charge_automatically",
    });

    res.status(200).json(subscription);
  }
);

const createCheckoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const { items,mode } = req.body;
    if (items.length === 0) {
      throw new ApiError("price & quantity missing", 404);
    }

    const session = await stripe.checkout.sessions.create({
      success_url: "http://localhost:3005/home",
      cancel_url: "http://localhost:3005/payment-cancel",
      line_items: [...items],
      mode: mode,
    });
    res.status(200).json(session);
  }
);

export {
  stripePaymentController,
  createStripeProductController,
  createStripeSubscription,
  createCheckoutController,
};
