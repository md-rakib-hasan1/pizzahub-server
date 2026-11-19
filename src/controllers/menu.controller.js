import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// Helper function
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// create menu item
export const createMenuItem = async (req, res) => {
    try {
        const db = getDB();

        const vendor = await db.collection("user").findOne({
            email: req.user.email,
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor account not found.",
            });
        }

        const isPremium = vendor.subscriptionPlan === "premium";

        if (!isPremium) {
            const activeMenuCount = await db.collection("menuItems").countDocuments({
                vendorId: req.user.id,
                isAvailable: true,
            });

            if (activeMenuCount >= 3) {
                return res.status(403).json({
                    success: false,
                    message: "Free plan allows only 3 active menu items. Upgrade to Premium for unlimited items.",
                });
            }
        }

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

// get all menu item
export const getAllMenuItems = async (req, res) => {
    try {
        const db = getDB();

        const {
            search,
            category,
            location,
            sort,
            page = "1",
            limit = "8",
        } = req.validatedQuery;

        const query = {
            approvalStatus: "approved",
            isAvailable: true,
        };

        if (search) {
            query.title = {
                $regex: escapeRegex(search),
                $options: "i",
            };
        }

        if (category) {
            query.category = {
                $regex: `^${escapeRegex(category)}$`,
                $options: "i",
            };
        }

        if (location) {
            query.location = {
                $regex: escapeRegex(location),
                $options: "i",
            };
        }

        const sortOptions = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            newest: { createdAt: -1 },
        };

        const sortBy = sortOptions[sort] || sortOptions.newest;

        const currentPage = Number(page);
        const itemsPerPage = Math.min(50, Number(limit));

        const skip = (currentPage - 1) * itemsPerPage;

        const collection = db.collection("menuItems");

        const [menuItems, totalItems] = await Promise.all([
            collection
                .find(query)
                .sort(sortBy)
                .skip(skip)
                .limit(itemsPerPage)
                .toArray(),

            collection.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            message: "Menu items fetched successfully.",
            results: menuItems.length,
            pagination: {
                currentPage,
                itemsPerPage,
                totalItems,
                totalPages: Math.ceil(totalItems / itemsPerPage),
            },
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

        if (
            req.body.isAvailable === true &&
            req.resource.isAvailable !== true
        ) {
            const vendor = await db.collection("user").findOne({
                email: req.user.email,
            });

            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    message: "Vendor account not found.",
                });
            }

            if (vendor.subscriptionPlan !== "premium") {
                const activeMenuCount = await db.collection("menuItems").countDocuments({
                    vendorId: req.user.id,
                    isAvailable: true,
                });

                if (activeMenuCount >= 3) {
                    return res.status(403).json({
                        success: false,
                        message: "Free plan allows only 3 active menu items. Upgrade to Premium for unlimited items.",
                    });
                }
            }
        }

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

//Admin Review 

export const reviewMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID.",
            });
        }

        const db = getDB();

        const result = await db.collection("menuItems").updateOne(
            {
                _id: new ObjectId(id),
                approvalStatus: "pending",
            },
            {
                $set: {
                    approvalStatus,
                    reviewedBy: req.user.id,
                    reviewedAt: new Date(),
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found or already reviewed.",
            });
        }

        res.status(200).json({
            success: true,
            message: `Menu item ${approvalStatus} successfully.`,
        });
    } catch (error) {
        console.error("Review menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to review menu item.",
        });
    }
};

//pending menu 

export const getPendingMenuItems = async (req, res) => {
    try {
        const db = getDB();

        const menuItems = await db
            .collection("menuItems")
            .find({
                approvalStatus: "pending",
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            message: "Pending menu items fetched successfully.",
            results: menuItems.length,
            data: menuItems,
        });
    } catch (error) {
        console.error("Get pending menu items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch pending menu items.",
        });
    }
};

// Get featured menu items for homepage
export const getFeaturedMenuItems = async (req, res) => {
    try {
        const db = getDB();

        const featuredItems = await db
            .collection("menuItems")
            .aggregate([
                {
                    $match: {
                        approvalStatus: "approved",
                        isAvailable: true,
                    },
                },
                {
                    $lookup: {
                        from: "user",
                        let: { vendorId: "$vendorId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $eq: [
                                                    { $toString: "$_id" },
                                                    "$$vendorId",
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$id",
                                                    "$$vendorId",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    subscriptionPlan: 1,
                                },
                            },
                        ],
                        as: "vendor",
                    },
                },
                {
                    $addFields: {
                        vendorPlan: {
                            $ifNull: [
                                {
                                    $arrayElemAt: [
                                        "$vendor.subscriptionPlan",
                                        0,
                                    ],
                                },
                                "free",
                            ],
                        },
                    },
                },
                {
                    $sort: {
                        vendorPlan: -1,
                        isFeatured: -1,
                        createdAt: -1,
                    },
                },
                {
                    $limit: 6,
                },
                {
                    $project: {
                        vendor: 0,
                        vendorPlan: 0,
                    },
                },
            ])
            .toArray();

        res.status(200).json({
            success: true,
            message: "Featured menu items fetched successfully.",
            results: featuredItems.length,
            data: featuredItems,
        });
    } catch (error) {
        console.error("Get featured menu items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch featured menu items.",
        });
    }
};

// Admin: Feature or unfeature a menu item
export const toggleFeaturedMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { isFeatured } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID.",
            });
        }

        if (typeof isFeatured !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isFeatured must be a boolean value.",
            });
        }

        const db = getDB();

        const result = await db.collection("menuItems").updateOne(
            {
                _id: new ObjectId(id),
                approvalStatus: "approved",
            },
            {
                $set: {
                    isFeatured,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Approved menu item not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: isFeatured
                ? "Menu item featured successfully."
                : "Menu item removed from featured section.",
        });
    } catch (error) {
        console.error("Toggle featured menu item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update featured status.",
        });
    }
};