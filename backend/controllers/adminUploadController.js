const fs = require('fs');
const path = require('path');

const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const decodeBase64DataUrl = (dataUrl) => {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
};

const mimeToExt = (mime) => {
  const [, subtype] = /^image\/(.+)$/.exec(mime) || [];
  if (!subtype) return 'png';
  if (subtype === 'jpeg') return 'jpg';
  return subtype;
};

const uploadProductImage = asyncHandler(async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new AppError('imageBase64 is required', 400, 'VALIDATION_ERROR');
  }

  if (!imageBase64.startsWith('data:image/')) {
    throw new AppError('Invalid image format. Use a data URL image payload.', 400, 'VALIDATION_ERROR');
  }

  const decoded = decodeBase64DataUrl(imageBase64);
  if (!decoded) throw new AppError('Invalid image data URL', 400, 'VALIDATION_ERROR');

  // Approx decoded bytes. (Base64 inflates size by ~4/3)
  const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
  const maxBytes = 2 * 1024 * 1024; // 2MB
  if (approxBytes > maxBytes) {
    throw new AppError('Product image is too large. Maximum allowed size is 2MB.', 400, 'VALIDATION_ERROR');
  }

  const buffer = Buffer.from(decoded.base64, 'base64');
  const ext = mimeToExt(decoded.mime);

  const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
  fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  // Mounted at /api/uploads in server.js
  const imageUrl = `/api/uploads/products/${filename}`;
  return res.json({ imageUrl });
});

module.exports = {
  uploadProductImage,
};

