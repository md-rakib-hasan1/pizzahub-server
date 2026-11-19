
import "dotenv/config";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing from .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;


export const PREMIUM_PLAN = {
    name: "PizzaHub Premium",
    amount: 999,
    currency: "usd",
    interval: "month",
};