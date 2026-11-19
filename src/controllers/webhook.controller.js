
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import stripe from "../config/stripe.js";

export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook signature verification failed:", error.message);

        return res.status(400).json({
            success: false,
            message: "Invalid webhook signature.",
        });
    }

    try {
        const db = getDB();
        const users = db.collection("user");

        // Activate Premium after successful checkout

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            if (
                session.mode !== "subscription" ||
                !session.subscription
            ) {
                return res.status(200).json({ received: true });
            }

            const vendorId = session.metadata?.vendorId;

            if (!vendorId || !ObjectId.isValid(vendorId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid vendor ID in checkout session.",
                });
            }

            // Retrieve subscription from Stripe
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription
            );

            // Verify subscription status
            const isActive = ["active", "trialing"].includes(
                subscription.status
            );

            if (!isActive) {
                console.log(
                    "Subscription is not active yet:",
                    subscription.status
                );

                return res.status(200).json({
                    received: true,
                    message: "Subscription is not active yet.",
                });
            }

            // Activate Premium for the vendor
            const result = await users.updateOne(
                {
                    _id: new ObjectId(vendorId),
                },
                {
                    $set: {
                        subscriptionPlan: "premium",
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: subscription.id,
                        subscriptionStatus: subscription.status,
                        subscriptionExpiresAt: new Date(
                            subscription.current_period_end * 1000
                        ),
                        updatedAt: new Date(),
                    },
                }
            );

            if (result.matchedCount === 0) {
                console.error("Vendor not found for subscription:", vendorId);
            }

            // Save transaction only if vendor exists
            if (result.matchedCount > 0) {
                await db.collection("transactions").updateOne(
                    {
                        stripeSessionId: session.id,
                    },
                    {
                        $setOnInsert: {
                            vendorId,
                            vendorEmail: session.customer_email,
                            type: "subscription",
                            plan: "premium",
                            amount: session.amount_total / 100,
                            currency: session.currency,
                            paymentStatus: session.payment_status,
                            stripeSessionId: session.id,
                            stripeSubscriptionId: subscription.id,
                            createdAt: new Date(),
                        },
                    },
                    {
                        upsert: true,
                    }
                );
            }
        }



        // Handle subscription updates and expiration
        if (event.type === "customer.subscription.updated") {
            const subscription = event.data.object;
            const vendorId = subscription.metadata?.vendorId;

            if (vendorId && ObjectId.isValid(vendorId)) {
                const isActive = ["active", "trialing"].includes(
                    subscription.status
                );

                await users.updateOne(
                    {
                        _id: new ObjectId(vendorId),
                        stripeSubscriptionId: subscription.id,
                    },
                    {
                        $set: {
                            subscriptionPlan: isActive ? "premium" : "free",
                            subscriptionStatus: subscription.status,
                            subscriptionExpiresAt: new Date(
                                subscription.current_period_end * 1000
                            ),
                            updatedAt: new Date(),
                        },
                    }
                );
            }
        }


        // Handle subscription cancellation
        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object;
            const vendorId = subscription.metadata?.vendorId;

            if (vendorId && ObjectId.isValid(vendorId)) {
                await users.updateOne(
                    {
                        _id: new ObjectId(vendorId),
                        stripeSubscriptionId: subscription.id,
                    },
                    {
                        $set: {
                            subscriptionPlan: "free",
                            subscriptionStatus: "canceled",
                            updatedAt: new Date(),
                        },
                    }
                );
            }
        }

        res.status(200).json({
            received: true,
        });
    } catch (error) {
        console.error("Stripe webhook processing error:", error);

        res.status(500).json({
            success: false,
            message: "Webhook processing failed.",
        });
    }
};
