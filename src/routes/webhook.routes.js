
import { Router } from "express";

import { handleStripeWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post(
    "/",
    (req, res, next) => {
        next();
    },
    handleStripeWebhook
);

export default router;
