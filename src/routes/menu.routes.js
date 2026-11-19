

import { Router } from "express";

import verifyOwnership from "../middleware/verifyOwnership.js";
import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";
import validateRequest from "../middleware/validateRequest.js";
import validateQuery from "../middleware/validateQuery.js";

import {
    createMenuSchema,
    updateMenuSchema,
    reviewMenuSchema,
    menuQuerySchema,
} from "../validators/menu.validator.js";

import {
    createMenuItem,
    getAllMenuItems,
    getSingleMenuItem,
    getMyMenuItems,
    updateMenuItem,
    deleteMenuItem,
    reviewMenuItem,
    getPendingMenuItems,
    getFeaturedMenuItems,
    toggleFeaturedMenuItem,
} from "../controllers/menu.controller.js";
const router = Router();

router.get(
    "/",
    validateQuery(menuQuerySchema),
    getAllMenuItems
);

router.get(
    "/my",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getMyMenuItems
);

router.get(
    "/pending",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    getPendingMenuItems
);
router.get("/featured", getFeaturedMenuItems);
router.get("/:id", getSingleMenuItem);

router.patch(
    "/:id",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    verifyOwnership({
        collectionName: "menuItems",
        ownerField: "vendorId",
    }),
    validateRequest(updateMenuSchema),
    updateMenuItem
);

router.delete(
    "/:id",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    verifyOwnership({
        collectionName: "menuItems",
        ownerField: "vendorId",
    }),
    deleteMenuItem
);

router.post(
    "/",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    validateRequest(createMenuSchema),
    createMenuItem
);

router.patch(
    "/:id/featured",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    toggleFeaturedMenuItem
);

router.patch(
    "/:id/review",
    verifyJWT,
    verifyActiveUser,
    verifyRole("admin"),
    validateRequest(reviewMenuSchema),
    reviewMenuItem
);

export default router;


