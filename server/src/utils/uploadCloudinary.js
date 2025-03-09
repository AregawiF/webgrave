const cloudinary = require('./cloudinary');

async function uploadCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

module.exports = uploadCloudinary;
