
import uploadToImgBB from "../services/image.service.js";

export const uploadMenuImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload.",
            });
        }

        const result = await uploadToImgBB(req.file.buffer);

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully.",
            data: {
                imageUrl: result.url,
            },
        });
    } catch (error) {
        console.error("Menu image upload error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to upload image.",
        });
    }
};

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a profile image.",
            });
        }

        const result = await uploadToImgBB(req.file.buffer);

        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully.",
            data: {
                imageUrl: result.url,
            },
        });
    } catch (error) {
        console.error("Profile image upload error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to upload profile image.",
        });
    }
};
