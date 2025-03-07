const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate unique QR code for a memorial
exports.generateMemorialQRCode = async (memorialId) => {
  try {
    // Generate a unique identifier for the memorial
    const uniqueCode = crypto.randomBytes(16).toString('hex');
    
    // Create QR code URL (pointing to the memorial page)
    const qrCodeUrl = `${process.env.FRONTEND_URL}/memorial/${memorialId}`;
    
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
    
    return {
      qrCode: qrCodeImage,
      uniqueCode: uniqueCode
    };
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// Validate QR code scan
exports.validateQRCodeScan = (memorialId, scannedCode) => {
  // Implement additional validation logic if needed
  return memorialId === scannedCode;
};
