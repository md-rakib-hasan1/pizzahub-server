
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const db = getDB();

        const users = await db
            .collection("user")
            .find(
                {},
                {
                    projection: {
                        name: 1,
                        email: 1,
                        role: 1,
                        isBlocked: 1,
                        subscriptionPlan: 1,
                        createdAt: 1,
                        image: 1,
                    },
                }
            )
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            results: users.length,
            data: users,
        });
    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};



export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        if (typeof isBlocked !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isBlocked must be a boolean value.",
            });
        }

        if (id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot change your own account status.",
            });
        }

        const db = getDB();

        const result = await db.collection("user").updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    isBlocked,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: isBlocked
                ? "User blocked successfully."
                : "User unblocked successfully.",
        });
    } catch (error) {
        console.error("Update user status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user status.",
        });
    }
};
