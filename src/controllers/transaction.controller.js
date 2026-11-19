
import { getDB } from "../config/db.js";

export const getAllTransactions = async (req, res) => {
    try {
        const db = getDB();

        const transactions = await db
            .collection("transactions")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Transactions fetched successfully.",
            results: transactions.length,
            data: transactions,
        });
    } catch (error) {
        console.error("Get all transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions.",
        });
    }
};
