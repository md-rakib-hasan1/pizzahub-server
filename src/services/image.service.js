const uploadToImgBB = async (imageBuffer) => {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("ImgBB API key is missing.");
    }

    const base64Image = imageBuffer.toString("base64");

    const formData = new FormData();

    formData.append("image", base64Image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message || "Image upload failed."
      );
    }

    return {
      url: result.data.url,
      deleteUrl: result.data.delete_url,
    };
  } catch (error) {
    console.error("ImgBB upload error:", error.message);
    throw error;
  }
};

export default uploadToImgBB;