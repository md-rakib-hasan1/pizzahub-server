
import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";

import {
    getAllUsers,
    updateUserStatus,
} from "../controllers/user.controller.js";

const router = Router();

// Get all users (Admin only)
router.get(
    "/",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    getAllUsers
);

// Block or unblock a user (Admin only)
router.patch(
    "/:id/status",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    updateUserStatus
);

export default router;
