import { Request, Response } from 'express';
import { Order } from '../booking/Order';
import { sendEmail } from '../../utils/sendEmail';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';

// @desc    Update order agreement details / Sign agreement
export const updateOrderAgreement = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update agreement specific fields
        if (req.body.agreementDetails) {
            if (!order.agreementDetails) order.agreementDetails = {};
            Object.assign(order.agreementDetails, req.body.agreementDetails);
        }
        if (req.body.agreementStatus) order.agreementStatus = req.body.agreementStatus;
        if (req.body.status) order.status = req.body.status;
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Invalid agreement data' });
    }
};

// @desc    Confirm payment / Upload proof
export const confirmPayment = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.body.financials) {
            const fin = req.body.financials;
            if (fin.paymentProof === undefined) delete fin.paymentProof;
            Object.assign(order.financials, fin);
            
            // Logic: Auto-update order status when payment is verified
            if (fin.paymentProof?.status === 'Verified') {
                order.status = 'Confirmed';
                order.agreementStatus = 'Completed';
            }
        }

        if (req.body.progress) {
            if (!order.progress) order.progress = { currentStep: 1, history: [] };
            Object.assign(order.progress, req.body.progress);
        }
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Invalid payment data' });
    }
};

// @desc    Upload payment proof to Cloudinary
export const uploadProof = async (req: Request, res: Response) => {
    try {
        console.log('--- Upload Attempt ---');
        console.log('File received:', !!req.file);
        if (req.file) {
            console.log('MimeType:', req.file.mimetype);
            console.log('Size:', req.file.size);
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Strategy: Stream upload to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'payment_proofs',
                        public_id: `proof_${order.orderNumber}_${Date.now()}`,
                    },
                    (error, result) => {
                        if (result) {
                            console.log('Cloudinary Success:', result.secure_url);
                            resolve(result);
                        } else {
                            console.error('Cloudinary Stream Error:', error);
                            reject(error);
                        }
                    }
                );
                Readable.from(req.file!.buffer).pipe(stream);
            });
        };

        const result: any = await uploadStream();
        console.log('Upload Stream Completed');

        // Update order financials
        if (!order.financials) {
            order.financials = {
                packagePrice: 0,
                transportCost: 0,
                totalAmount: 0,
                balance: 0
            };
        }

        order.financials.paymentProof = {
            url: result.secure_url,
            status: 'Pending',
            uploadedAt: new Date()
        };

        order.agreementStatus = 'Reviewing';
        await order.save();

        res.json({
            success: true,
            url: result.secure_url
        });
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
    }
};
