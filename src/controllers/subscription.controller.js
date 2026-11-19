
import { getDB } from "../config/db.js";
import stripe, { PREMIUM_PLAN } from "../config/stripe.js";

export const createPremiumCheckout = async (req, res) => {
    try {
        const db = getDB();

        const vendor = await db.collection("user").findOne({
            email: req.user.email,
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor account not found.",
            });
        }

        if (vendor.subscriptionPlan === "premium") {
            return res.status(409).json({
                success: false,
                message: "You already have a Premium subscription.",
            });
        }

        const clientURL = process.env.CLIENT_URL;

        if (!clientURL) {
            throw new Error("CLIENT_URL is missing from .env");
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",

            customer_email: req.user.email,

            line_items: [
                {
                    price_data: {
                        currency: PREMIUM_PLAN.currency,
                        product_data: {
                            name: PREMIUM_PLAN.name,
                        },
                        unit_amount: PREMIUM_PLAN.amount,
                        recurring: {
                            interval: PREMIUM_PLAN.interval,
                        },
                    },
                    quantity: 1,
                },
            ],

            metadata: {
                vendorId: req.user.id,
            },

            subscription_data: {
                metadata: {
                    vendorId: req.user.id,
                },
            },

            success_url: `${clientURL}/dashboard/vendor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: `${clientURL}/dashboard/vendor/subscription/cancel`,
        });

        res.status(200).json({
            success: true,
            message: "Premium checkout session created successfully.",
            data: {
                checkoutUrl: session.url,
            },
        });
    } catch (error) {
        console.error("Premium checkout error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create Premium checkout session.",
        });
    }
};


export const cancelPremiumSubscription = async (req, res) => {
    try {
        const db = getDB();

        const vendor = await db.collection("user").findOne({
            email: req.user.email,
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor account not found.",
            });
        }

        if (
            vendor.subscriptionPlan !== "premium" ||
            !vendor.stripeSubscriptionId
        ) {
            return res.status(400).json({
                success: false,
                message: "No active Premium subscription found.",
            });
        }

        const subscription = await stripe.subscriptions.update(
            vendor.stripeSubscriptionId,
            {
                cancel_at_period_end: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Subscription cancellation scheduled successfully.",
            data: {
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                subscriptionExpiresAt: new Date(
                    subscription.current_period_end * 1000
                ),
            },
        });
    } catch (error) {
        console.error("Cancel subscription error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel subscription.",
        });
    }
};
