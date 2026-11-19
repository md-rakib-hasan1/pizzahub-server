
import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";

import {
    getAllTransactions,
} from "../controllers/transaction.controller.js";

const router = Router();

// Get all transactions (Admin only)
router.get(
    "/",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    getAllTransactions
);

export default router;
