const cloudinary = require('./cloudinary');
const fs = require('fs');

async function uploadCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, { resource_type: "auto" });

    // Delete the local file after successful upload
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting local file:', err);
      } else {
        console.log(`Successfully deleted local file: ${filePath}`);
      }
    });


    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

module.exports = uploadCloudinary;
