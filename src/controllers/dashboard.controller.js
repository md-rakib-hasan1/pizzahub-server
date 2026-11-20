
import { getDB } from "../config/db.js";

export const getVendorDashboardStats = async (req, res) => {
    try {
        const db = getDB();

        const vendorId = req.user.id;

        const menuItems = db.collection("menuItems");
        const orders = db.collection("orders");

        const [
            totalMenuItems,
            approvedMenuItems,
            pendingMenuItems,
            totalOrders,
            pendingOrders,
            acceptedOrders,
            rejectedOrders,
        ] = await Promise.all([
            menuItems.countDocuments({ vendorId }),
            menuItems.countDocuments({
                vendorId,
                approvalStatus: "approved",
            }),
            menuItems.countDocuments({
                vendorId,
                approvalStatus: "pending",
            }),
            orders.countDocuments({ vendorId }),
            orders.countDocuments({
                vendorId,
                status: "pending",
            }),
            orders.countDocuments({
                vendorId,
                status: "accepted",
            }),
            orders.countDocuments({
                vendorId,
                status: "rejected",
            }),
        ]);

        res.status(200).json({
            success: true,
            message: "Vendor dashboard statistics fetched successfully.",
            data: {
                menu: {
                    total: totalMenuItems,
                    approved: approvedMenuItems,
                    pending: pendingMenuItems,
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    accepted: acceptedOrders,
                    rejected: rejectedOrders,
                },
            },
        });
    } catch (error) {
        console.error("Vendor dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor dashboard statistics.",
        });
    }
};


export const getCustomerDashboardStats = async (req, res) => {
    try {
        const db = getDB();

        const customerId = req.user.id;
        const orders = db.collection("orders");

        const [
            totalOrders,
            pendingOrders,
            acceptedOrders,
            rejectedOrders,
            cancelledOrders,
        ] = await Promise.all([
            orders.countDocuments({ customerId }),
            orders.countDocuments({
                customerId,
                status: "pending",
            }),
            orders.countDocuments({
                customerId,
                status: "accepted",
            }),
            orders.countDocuments({
                customerId,
                status: "rejected",
            }),
            orders.countDocuments({
                customerId,
                status: "cancelled",
            }),
        ]);

        res.status(200).json({
            success: true,
            message: "Customer dashboard statistics fetched successfully.",
            data: {
                totalOrders,
                pendingOrders,
                acceptedOrders,
                rejectedOrders,
                cancelledOrders,
            },
        });
    } catch (error) {
        console.error("Customer dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer dashboard statistics.",
        });
    }
};


export const getAdminDashboardStats = async (req, res) => {
    try {
        const db = getDB();

        const users = db.collection("user");
        const menuItems = db.collection("menuItems");
        const orders = db.collection("orders");
        const transactions = db.collection("transactions");

        const [
            totalUsers,
            totalCustomers,
            totalVendors,
            blockedUsers,
            totalMenuItems,
            pendingMenuItems,
            totalOrders,
            totalTransactions,
        ] = await Promise.all([
            users.countDocuments({}),
            users.countDocuments({ role: "customer" }),
            users.countDocuments({ role: "vendor" }),
            users.countDocuments({ isBlocked: true }),
            menuItems.countDocuments({}),
            menuItems.countDocuments({ approvalStatus: "pending" }),
            orders.countDocuments({}),
            transactions.countDocuments({}),
        ]);

        res.status(200).json({
            success: true,
            message: "Admin dashboard statistics fetched successfully.",
            data: {
                users: {
                    total: totalUsers,
                    customers: totalCustomers,
                    vendors: totalVendors,
                    blocked: blockedUsers,
                },
                menu: {
                    total: totalMenuItems,
                    pending: pendingMenuItems,
                },
                totalOrders,
                totalTransactions,
            },
        });
    } catch (error) {
        console.error("Admin dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admin dashboard statistics.",
        });
    }
};


export const getVendorRecentOrders = async (req, res) => {
    try {
        const db = getDB();

        const recentOrders = await db
            .collection("orders")
            .find({ vendorId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        res.status(200).json({
            success: true,
            message: "Recent vendor orders fetched successfully.",
            results: recentOrders.length,
            data: recentOrders,
        });
    } catch (error) {
        console.error("Vendor recent orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent vendor orders.",
        });
    }
};


export const getCustomerRecentOrders = async (req, res) => {
    try {
        const db = getDB();

        const recentOrders = await db
            .collection("orders")
            .find({ customerId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        res.status(200).json({
            success: true,
            message: "Recent customer orders fetched successfully.",
            results: recentOrders.length,
            data: recentOrders,
        });
    } catch (error) {
        console.error("Customer recent orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent customer orders.",
        });
    }
};


export const getAdminRecentTransactions = async (req, res) => {
    try {
        const db = getDB();

        const recentTransactions = await db
            .collection("transactions")
            .find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        res.status(200).json({
            success: true,
            message: "Recent transactions fetched successfully.",
            results: recentTransactions.length,
            data: recentTransactions,
        });
    } catch (error) {
        console.error("Admin recent transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent transactions.",
        });
    }
};



export const getVendorMonthlyOrders = async (req, res) => {
    try {
        const db = getDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyOrders = await db
            .collection("orders")
            .aggregate([
                {
                    $match: {
                        vendorId: req.user.id,
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        totalOrders: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $dateToString: {
                                format: "%b %Y",
                                date: {
                                    $dateFromParts: {
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        day: 1,
                                    },
                                },
                            },
                        },
                        totalOrders: 1,
                    },
                },
            ])
            .toArray();

        res.status(200).json({
            success: true,
            message: "Monthly order analytics fetched successfully.",
            data: monthlyOrders,
        });
    } catch (error) {
        console.error("Vendor monthly orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly order analytics.",
        });
    }
};


export const getVendorMonthlyRevenue = async (req, res) => {
    try {
        const db = getDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenue = await db
            .collection("orders")
            .aggregate([
                {
                    $match: {
                        vendorId: req.user.id,
                        status: "accepted",
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        revenue: { $sum: "$price" },
                    },
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $dateToString: {
                                format: "%b %Y",
                                date: {
                                    $dateFromParts: {
                                        year: "$_id.year",
                                        month: "$_id.month",
                                        day: 1,
                                    },
                                },
                            },
                        },
                        revenue: { $round: ["$revenue", 2] },
                    },
                },
            ])
            .toArray();

        res.status(200).json({
            success: true,
            message: "Monthly revenue analytics fetched successfully.",
            currency: "USD",
            data: monthlyRevenue,
        });
    } catch (error) {
        console.error("Vendor monthly revenue error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly revenue analytics.",
        });
    }
};
