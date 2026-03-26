import express from 'express';
import { getOrders, getOrderById, getOrderByToken, createOrder, updateOrder, deleteOrder, getLatestOrderNumber } from './bookingController';
import { getPricingItems, createPricingItem, updatePricingItem, deletePricingItem } from './pricingController';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderSchema } from './bookingValidation';

const router = express.Router();

// Pricing Management (Member 1)
router.route('/pricing')
    .get(getPricingItems)
    .post(createPricingItem);

router.route('/pricing/:id')
    .put(updatePricingItem)
    .delete(deletePricingItem);

// Order Management (Member 1)
router.route('/')
    .get(getOrders)
    .post(validateRequest(createOrderSchema), createOrder);

router.get('/latest-number', getLatestOrderNumber);

router.get('/token/:tokenType/:token', getOrderByToken);

router.route('/:id')
    .get(getOrderById)
    .put(validateRequest(updateOrderSchema), updateOrder)
    .delete(deleteOrder);

export default router;
