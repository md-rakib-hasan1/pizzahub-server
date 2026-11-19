
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export const createOrder = async (req, res) => {
    try {
        const db = getDB();

        const { menuItemId, deliveryDate, deliveryAddress, message } =
            req.body;

        const menuItem = await db.collection("menuItems").findOne({
            _id: new ObjectId(menuItemId),
            approvalStatus: "approved",
            isAvailable: true,
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found or unavailable.",
            });
        }

        if (menuItem.vendorId === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot order your own menu item.",
            });
        }

        const existingOrder = await db.collection("orders").findOne({
            customerId: req.user.id,
            menuItemId: new ObjectId(menuItemId),
            status: { $in: ["pending", "accepted"] },
        });

        if (existingOrder) {
            return res.status(409).json({
                success: false,
                message: "You already have an active order for this item.",
            });
        }

        const order = {
            menuItemId: new ObjectId(menuItemId),
            menuItemTitle: menuItem.title,
            price: menuItem.price,

            customerId: req.user.id,
            customerEmail: req.user.email,
            vendorId: menuItem.vendorId,

            deliveryDate: new Date(deliveryDate),
            deliveryAddress,
            message,

            status: "pending",

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("orders").insertOne(order);

        res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            data: {
                _id: result.insertedId,
                ...order,
            },
        });
    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to place order.",
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const db = getDB();

        const orders = await db
            .collection("orders")
            .find({
                customerId: req.user.id,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Your orders fetched successfully.",
            results: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Get customer orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your orders.",
        });
    }
};

export const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const db = getDB();

        const order = await db.collection("orders").findOne({
            _id: new ObjectId(id),
            customerId: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order details fetched successfully.",
            data: order,
        });
    } catch (error) {
        console.error("Get single order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order details.",
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const db = getDB();

        const result = await db.collection("orders").updateOne(
            {
                _id: new ObjectId(id),
                customerId: req.user.id,
                status: "pending",
            },
            {
                $set: {
                    status: "cancelled",
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or cannot be cancelled.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
        });
    } catch (error) {
        console.error("Cancel order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to cancel order.",
        });
    }
};

export const getVendorOrders = async (req, res) => {
    try {
        const db = getDB();

        const orders = await db
            .collection("orders")
            .find({
                vendorId: req.user.id,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Vendor orders fetched successfully.",
            results: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Get vendor orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor orders.",
        });
    }
};

export const acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const db = getDB();

        const result = await db.collection("orders").updateOne(
            {
                _id: new ObjectId(id),
                vendorId: req.user.id,
                status: "pending",
            },
            {
                $set: {
                    status: "accepted",
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or cannot be accepted.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order accepted successfully.",
        });
    } catch (error) {
        console.error("Accept order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to accept order.",
        });
    }
};

export const rejectOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID.",
            });
        }

        const db = getDB();

        const result = await db.collection("orders").updateOne(
            {
                _id: new ObjectId(id),
                vendorId: req.user.id,
                status: "pending",
            },
            {
                $set: {
                    status: "rejected",
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or cannot be rejected.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order rejected successfully.",
        });
    } catch (error) {
        console.error("Reject order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reject order.",
        });
    }
};