import express from 'express';
import { getOrders, getOrderById, getOrderByToken, createOrder, updateOrder, deleteOrder, getAvailability } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected admin routes
router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

// Availability check (Admin only)
router.get('/availability', protect, getAvailability);

// Public token-based access (Client portal/tracking/agreement)
router.get('/token/:tokenType/:token', getOrderByToken);

// Operations by ID (Some might need public access like saving agreement info, but we'll use PUT for now mapped here and handle auth logic simply)
router.route('/:id')
    .get(getOrderById) // Allowed for both public (if they hit it via tracking link logic) or private
    .put(updateOrder)   // Allowed for both
    .delete(protect, deleteOrder);

export default router;
