const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderDetails,
  updateOrderDeliveryWorkflow,
  deleteOrder,
  deleteOrdersBulk,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

router.get('/', protect, admin, getOrders);
router.delete('/', protect, admin, deleteOrdersBulk);
router.put('/:id', protect, admin, updateOrderDetails);
router.put('/:id/delivery', protect, admin, updateOrderDeliveryWorkflow);
router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;

