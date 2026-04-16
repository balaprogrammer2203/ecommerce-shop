const express = require('express');

const {
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  createPaypalOrder,
  capturePaypalOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/stripe/checkout-session', protect, createStripeCheckoutSession);
router.post('/stripe/checkout-session/confirm', protect, confirmStripeCheckoutSession);
router.post('/paypal/orders', protect, createPaypalOrder);
router.post('/paypal/orders/capture', protect, capturePaypalOrder);
router.post('/razorpay/orders', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
