import express from 'express';
import { updateOrderAgreement, confirmPayment, uploadProof } from './agreementController';
import { upload } from '../../middleware/uploadMiddleware';

const router = express.Router();

router.post('/sign/:id', updateOrderAgreement);
router.post('/payment/:id', confirmPayment);
router.post('/upload-proof/:id', upload.single('file'), uploadProof);

export default router;
