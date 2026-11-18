import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const createMenuItem = async (req, res) => {
    try {
        const db = getDB();

        const menuItem = {
            ...req.body,

            vendorId: req.user.id,

            approvalStatus: "pending",
            isFeatured: false,

            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("menuItems")
            .insertOne(menuItem);

        res.status(201).json({
            success: true,
            message: "Menu item created successfully.",
            data: {
                _id: result.insertedId,
                ...menuItem,
            },
        });
    } catch (error) {
        console.error("Create menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create menu item.",
        });
    }
};

export const getAllMenuItems = async (req, res) => {
    try {
        const db = getDB();

        const menuItems = await db
            .collection("menuItems")
            .find({
                approvalStatus: "approved",
                isAvailable: true,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Menu items fetched successfully.",
            results: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        console.error("Get menu items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch menu items.",
        });
    }
};


//single Item
export const getSingleMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID.",
            });
        }

        const db = getDB();

        const menuItem = await db
            .collection("menuItems")
            .findOne({
                _id: new ObjectId(id),
                approvalStatus: "approved",
                isAvailable: true,
            });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item fetched successfully.",
            data: menuItem,
        });
    } catch (error) {
        console.error("Get single menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch menu item.",
        });
    }
};

//personal menu create

export const getMyMenuItems = async (req, res) => {
    try {
        const db = getDB();

        const menuItems = await db
            .collection("menuItems")
            .find({
                vendorId: req.user.id,
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Your menu items fetched successfully.",
            results: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        console.error("Get my menu items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your menu items.",
        });
    }
};


//update menu
export const updateMenuItem = async (req, res) => {
    try {
        const db = getDB();

        const updateData = {
            ...req.body,
            updatedAt: new Date(),
        };

        await db.collection("menuItems").updateOne(
            {
                _id: req.resource._id,
            },
            {
                $set: updateData,
            }
        );

        const updatedMenuItem = await db
            .collection("menuItems")
            .findOne({
                _id: req.resource._id,
            });

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully.",
            data: updatedMenuItem,
        });
    } catch (error) {
        console.error("Update menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update menu item.",
        });
    }
};

//delete menu item

export const deleteMenuItem = async (req, res) => {
    try {
        const db = getDB();

        await db.collection("menuItems").deleteOne({
            _id: req.resource._id,
        });

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully.",
        });
    } catch (error) {
        console.error("Delete menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete menu item.",
        });
    }
};