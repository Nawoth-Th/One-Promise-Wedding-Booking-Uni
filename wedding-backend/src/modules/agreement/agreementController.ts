import { Request, Response } from 'express';
import { Order } from '../booking/Order';
import { sendEmail } from '../../utils/sendEmail';

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
