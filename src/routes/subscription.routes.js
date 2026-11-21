
import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";

import {
    createPremiumCheckout,
    cancelPremiumSubscription,
    getSubscriptionStatus,
} from "../controllers/subscription.controller.js";

const router = Router();

// Create Premium subscription checkout session
router.post(
    "/checkout",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    createPremiumCheckout,
);

router.get(
    "/status",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getSubscriptionStatus
);

router.patch(
    "/cancel",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    cancelPremiumSubscription
);

export default router;
