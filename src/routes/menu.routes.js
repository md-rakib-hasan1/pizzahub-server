

import { Router } from "express";

import verifyOwnership from "../middleware/verifyOwnership.js";
import { updateMenuSchema } from "../validators/menu.validator.js";
import { updateMenuItem } from "../controllers/menu.controller.js";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";
import validateRequest from "../middleware/validateRequest.js";

import { createMenuSchema } from "../validators/menu.validator.js";
import {
    createMenuItem,
    getAllMenuItems,
    getSingleMenuItem,
    getMyMenuItems,
} from "../controllers/menu.controller.js";
const router = Router();

router.get("/", getAllMenuItems);

router.get(
    "/my",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    getMyMenuItems
);

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
router.post(
    "/",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    validateRequest(createMenuSchema),
    createMenuItem
);

export default router;


