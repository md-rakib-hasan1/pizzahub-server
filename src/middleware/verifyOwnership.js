
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const verifyOwnership = ({
    collectionName,
    ownerField,
    paramName = "id",
}) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];

            if (!ObjectId.isValid(resourceId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid resource ID.",
                });
            }

            const db = getDB();

            const resource = await db
                .collection(collectionName)
                .findOne({
                    _id: new ObjectId(resourceId),
                });

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: "Resource not found.",
                });
            }

            const resourceOwnerId = resource[ownerField]?.toString();
            const currentUserId = req.user.id?.toString();

            if (!resourceOwnerId || resourceOwnerId !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: "You do not own this resource.",
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error("Ownership verification failed:", error);

            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    };
};

export default verifyOwnership;
