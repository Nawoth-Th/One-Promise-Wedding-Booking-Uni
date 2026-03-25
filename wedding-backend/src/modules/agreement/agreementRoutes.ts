import express from 'express';
import { updateOrderAgreement, confirmPayment } from './agreementController';

const router = express.Router();

router.post('/sign/:id', updateOrderAgreement);
router.post('/payment/:id', confirmPayment);

export default router;
