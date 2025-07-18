import { Express, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import stripe from "../config/stripe";
import ApiError from "../utils/ApiError";
import { StripePayment, StripeUser } from "../models";

import Stripe from "stripe";

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

const createStripeCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    console.log("AM HERE INSIDE THE CREATE STRIPE CUSTOMER");
    // 1. Create customer in Stripe
    const customer = await stripe.customers.create({ name, email, phone });
    // 2. Save to DB
    const newUser = await StripeUser.create({
      name,
      email,
      phone,
      userId: customer.id,
    });

    const tokenPayload = {
      userId: newUser.id, // your internal DB user id
      stripeCustomerId: customer.id, // optional, useful to include
    };
    console.log("this is jwt secret", process.env.JWT_SECRET);
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Customer created",
      newUser,
      accessToken: token,
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

const DeleteCustomerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;
    await stripe.customers.del(customerId);
    await StripeUser.update(
      { is_archived: true },
      {
        where: {
          userId: customerId,
        },
      }
    );
    res.status(200).json({
      message: "delete successfully",
    });
  }
);

const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"]!;
    let event: Stripe.Event;
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    let response;
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const latestChargeId = paymentIntent.latest_charge as string;

        const charges = await retrieveCharges(latestChargeId);

        response = await savePayment(paymentIntent, charges);

        break;
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        // save order/payment to DB
        break;
      default:
        console.warn(`unhandled event type ${event.type}`);
    }
    res.status(200).json({ received: true });
  }
);

const retrieveCharges = async (chargerId: string) => {
  try {
    return await stripe.charges.retrieve(chargerId);
  } catch (error) {
    console.log("charge retrival error", error);
    throw error;
  }
};

const savePayment = async (
  paymentIntent: Stripe.PaymentIntent,
  charge: Stripe.Charge
) => {
  console.log("this is paymentINETENT=-=-=->", paymentIntent);
  try {
    const paymentData = {
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customerId: (paymentIntent.customer as string) || "",
      userId: paymentIntent.metadata.userId || "",
      paymentMethod: charge.payment_method_details?.type || "",
      receiptUrl: charge.receipt_url || "",
      description: paymentIntent.description || "",
    };
    console.log("payment DATA-=-=-=>", paymentData);
    const result = await StripePayment.create(paymentData);
    return result;
  } catch (error) {
    console.log("❌ Error saving payment to DB", error);
    throw error;
  }
};

export {
  stripePaymentController,
  createStripeProductController,
  createStripeSubscription,
  createStripeCustomer,
  createCheckoutController,
  getStripCustomerDetails,
  updateStripeCustomer,
  DeleteCustomerController,
  handleStripeWebhook,
};
