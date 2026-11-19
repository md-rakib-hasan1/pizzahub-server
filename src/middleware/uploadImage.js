import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only JPG, PNG, and WEBP images are allowed."),
            false
        );
    }
};

const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export const uploadSingleImage = (req, res, next) => {
    uploadImage.single("image")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Image upload failed.",
            });
        }

        next();
    });
};

export default uploadImage;