import { Express, NextFunction, Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler";
import stripe from "../config/stripe";
import ApiError from "../utils/ApiError";
import { StripeUser } from "../models";
import sequelize from "sequelize";
import stripeUserModel from "../models/stripe_customer.model";
import { stat } from "fs";

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
    const { items, mode } = req.body;
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

export const createStripeCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, userId } = req.body;

    // 1. Create customer in Stripe
    const customer = await stripe.customers.create({ name, email, phone });
    // 2. Save to DB
    const newUser = await StripeUser.create({
      name,
      email,
      phone,
      userId: customer.id,
    });
    console.log("stripcustomer", customer);
    res.status(201).json({
      message: "Customer created",
      newUser,
    });
  }
);

const getStripCustomerDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await StripeUser.findOne({ where: { email } });
    if (user) {
      const customer = await stripe.customers.retrieve(user.userId);
      res.status(200).json({
        message: "Retrived Successfully",
        result: customer,
      });
    }
  }
);

const updateStripeCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { customerData } = req.body;

    const update_data = await stripe.customers.update(customerId, {
      ...customerData,
    });

    await StripeUser.update(
      { ...customerData },
      {
        where: {
          userId: customerId,
        },
      }
    );

    res.status(200).json({
      statusCode: 200,
      message: "update successfully",
    });
  }
);
export {
  stripePaymentController,
  createStripeProductController,
  createStripeSubscription,
  createCheckoutController,
  getStripCustomerDetails,
  updateStripeCustomer,
};
