const express = require('express');

const { uploadProductImage } = require('../controllers/adminUploadController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/product-image', protect, admin, uploadProductImage);

module.exports = router;

