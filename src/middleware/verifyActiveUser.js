
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const verifyActiveUser = async (req, res, next) => {
    try {
        const db = getDB();

        const userId = req.user.id;
        const userEmail = req.user.email;

        const userFilters = [
            { _id: userId },
            { id: userId },
        ];

        if (ObjectId.isValid(userId) && userId.length === 24) {
            userFilters.push({
                _id: new ObjectId(userId),
            });
        }

        if (userEmail) {
            userFilters.push({ email: userEmail });
        }

        const user = await db.collection("user").findOne({
            $or: userFilters,
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        // Support both Boolean and String values
        const isBlocked =
            user.isBlocked === true ||
            user.isBlocked === "true";

        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked.",
            });
        }

        req.user.isBlocked = false;

        next();
    } catch (error) {
        console.error("Active user verification failed:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify user account.",
        });
    }
};

export default verifyActiveUser;
