import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SCERET_KEY as string, {
  apiVersion: "2025-06-30.basil",
});

export default stripe;
