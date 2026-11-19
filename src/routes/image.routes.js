
import { Router } from "express";

import verifyJWT from "../middleware/verifyJWT.js";
import verifyActiveUser from "../middleware/verifyActiveUser.js";
import verifyRole from "../middleware/verifyRole.js";

import { uploadSingleImage } from "../middleware/uploadImage.js";
import {
    uploadMenuImage,
    uploadProfileImage,
} from "../controllers/image.controller.js";

const router = Router();

router.post(
    "/menu",
    verifyJWT,
    verifyActiveUser,
    verifyRole("vendor"),
    uploadSingleImage,
    uploadMenuImage
);

router.post(
    "/profile",
    verifyJWT,
    verifyActiveUser,
    uploadSingleImage,
    uploadProfileImage
);

export default router;
