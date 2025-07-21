import { Express, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import stripe from "../config/stripe";
import ApiError from "../utils/ApiError";
import { StripePayment, StripeSubscription, StripeUser } from "../models";

import Stripe from "stripe";
import stripeService from "../services/stripe.service";

const stripePaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, stripeCustomerId } = req.user!;
    console.log("userId", userId);
    console.log("stripCustomerId", stripeCustomerId);
    const { amount, currency } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId: userId,
        customerId: stripeCustomerId,
      },
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
    const { email, payment_method_id, priceId } = req.body;

    const { userId } = req.user!;

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
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
      payment_behavior: "default_incomplete",
      collection_method: "charge_automatically",
    });
    const result = await stripeService.saveSubscriptionToDatabase({
      userId: userId,
      stripeSubscriptionId: subscription.id, // string id from Stripe
      status: subscription.status,
      currentPeriodStart: new Date(
        subscription.items.data[0].current_period_start * 1000
      ), // convert UNIX timestamp to Date
      currentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ), // convert UNIX timestamp to Date
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planId: subscription.items.data[0].plan.id, // plan id string from Stripe
    });

    res.status(200).json({
      status: 200,
      message: "subscription created successfully",
      result: result,
    });
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

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Customer created",
      newUser,
      accessToken: token,
      refreshToken: refreshToken,
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
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId || "0");
        if (!userId) {
          console.warn("No userId found in subscription metadata");
          break;
        }
        await stripeService.saveSubscriptionToDatabase({
          userId: userId,
          stripeSubscriptionId: subscription.id, // string id from Stripe
          status: subscription.status,
          currentPeriodStart: new Date(
            subscription.items.data[0].current_period_start * 1000
          ), // convert UNIX timestamp to Date
          currentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ), // convert UNIX timestamp to Date
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          planId: subscription.items.data[0].plan.id, // plan id string from Stripe
        });
        break;
      }
        
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await stripeService.markSubscriptionDelete(subscription.id);
        break;
      }

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
  try {
    const paymentData = {
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customerId: (paymentIntent.metadata.customerId as string) || "",
      userId: parseInt(paymentIntent.metadata.userId),
      paymentMethod: charge.payment_method_details?.type || "",
      receiptUrl: charge.receipt_url || "",
      description: paymentIntent.description || "",
    };

    const result = await StripePayment.create(paymentData);
    return result;
  } catch (error) {
    console.log("❌ Error saving payment to DB", error);
    throw error;
  }
};
const getStripePaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    console.log("this is the TYPE OF USERID=-=->", typeof userId);
    if (!userId) {
      throw new ApiError("User Id is not provided", 400);
    }
    const payments = await StripePayment.findAll({
      where: { userId },
      include: [
        {
          model: StripeUser,
          as: "userDetails",
          attributes: ["name", "email", "phone"],
        },
      ],
    });
    res.status(200).json({
      status: 200,
      message: "successfully retirved payment history",
      result: payments,
    });
  }
);

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
  getStripePaymentController,
};
