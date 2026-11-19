
import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";
import validateRequest from "../middleware/validateRequest.js";

import { createOrderSchema } from "../validators/order.validator.js";

import {
    createOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    getVendorOrders,
    acceptOrder,
    rejectOrder,
} from "../controllers/order.controller.js";

const router = Router();

// Place a new order
router.post(
    "/",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    validateRequest(createOrderSchema),
    createOrder
);

// Get logged-in customer's orders
router.get(
    "/my",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    getMyOrders
);

// Get logged-in vendor's orders
router.get(
    "/vendor",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getVendorOrders
);

// Accept a pending order
router.patch(
    "/:id/accept",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    acceptOrder
);

// Reject a pending order
router.patch(
    "/:id/reject",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    rejectOrder
);

// Get a single order
router.get(
    "/:id",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    getSingleOrder
);

// Cancel a pending order
router.patch(
    "/:id/cancel",
    verifyJWT,
    verifyActiveUser,
    verifyRole("customer"),
    cancelOrder
);

export default router;
