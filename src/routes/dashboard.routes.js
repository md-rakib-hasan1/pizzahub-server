import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";

import {
    getVendorDashboardStats,
    getCustomerDashboardStats,
    getAdminDashboardStats,
    getVendorRecentOrders,
    getCustomerRecentOrders,
    getAdminRecentTransactions,
    getVendorMonthlyOrders,
    getVendorMonthlyRevenue,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get(
    "/vendor/stats",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getVendorDashboardStats
);

router.get(
    "/vendor/recent-orders",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getVendorRecentOrders
);

router.get(
    "/vendor/monthly-orders",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getVendorMonthlyOrders
);

router.get(
    "/vendor/monthly-revenue",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getVendorMonthlyRevenue
);

router.get(
    "/customer/stats",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    getCustomerDashboardStats
);

router.get(
    "/customer/recent-orders",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    getCustomerRecentOrders
);

router.get(
    "/admin/stats",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    getAdminDashboardStats
);

router.get(
    "/admin/recent-transactions",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    getAdminRecentTransactions
);

export default router;