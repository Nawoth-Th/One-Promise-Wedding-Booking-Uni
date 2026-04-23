import { Request, Response } from 'express';
import { Order } from '../booking/Order';
import { sendEmail } from '../../utils/sendEmail';
import { generateEmailHtml } from '../../utils/emailTemplate';
import cloudinary from '../../config/cloudinary';
import { Readable } from 'stream';

/**
 * @file agreementController.ts
 * @description Manages agreement signing, payment proof uploads, and automated email triggers for the agreement lifecycle.
 */

// @desc    Update order agreement details / Sign agreement
export const updateOrderAgreement = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.agreementStatus;
        
        // Update agreement specific fields
        if (req.body.agreementDetails) {
            if (!order.agreementDetails) order.agreementDetails = {};
            Object.assign(order.agreementDetails, req.body.agreementDetails);
        }
        if (req.body.agreementStatus) order.agreementStatus = req.body.agreementStatus;
        if (req.body.status) order.status = req.body.status;
        
        const updatedOrder = await order.save();

        // Feature: Automated Email Triggers
        const clientEmail = updatedOrder.clientInfo.email;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (clientEmail) {
            // Trigger 1: Agreement Sent
            if (updatedOrder.agreementStatus === 'Sent' && oldStatus !== 'Sent') {
                await sendEmail({
                    email: clientEmail,
                    subject: `Action Required: Wedding Photography Agreement - ${updatedOrder.orderNumber}`,
                    message: `Hello ${updatedOrder.clientInfo.name}, your agreement is ready.`,
                    html: generateEmailHtml({
                        title: 'Agreement Ready for Review',
                        content: `<p>Hello ${updatedOrder.clientInfo.name},</p><p>Your photography agreement for Order <strong>${updatedOrder.orderNumber}</strong> is ready for review.</p><p>Please click the button below to view and sign it online.</p>`,
                        ctaText: 'View & Sign Agreement',
                        ctaUrl: `${frontendUrl}/portal/agreement/${updatedOrder.agreementToken}`
                    })
                });
            }

            // Trigger 2: Agreement Signed
            if (updatedOrder.agreementStatus === 'Signed' && oldStatus !== 'Signed') {
                // To Client: Signature Confirmation + Payment Request
                await sendEmail({
                    email: clientEmail,
                    subject: `Confirmed: Agreement Signed & Next Steps - ${updatedOrder.orderNumber}`,
                    message: `Hello ${updatedOrder.clientInfo.name}, thank you for signing. Please pay the advance of Rs. 25,000 to our bank account.`,
                    html: generateEmailHtml({
                        title: 'Signature Received & Next Steps',
                        content: `
                            <p>Hello ${updatedOrder.clientInfo.name},</p>
                            <p>Thank you for signing the professional photography agreement for Order <strong>${updatedOrder.orderNumber}</strong>. We have officially received your digital signature.</p>
                            
                            <div style="background-color: #f0f7ff; border-left: 4px solid #467889; padding: 20px; margin: 25px 0;">
                                <h3 style="margin-top: 0; color: #1a1a1a;">💳 Advance Payment Required</h3>
                                <p>To finalize your booking date, a non-refundable advance payment of <strong>Rs. 25,000/-</strong> is required.</p>
                                
                                <p style="margin-bottom: 5px;"><strong>Bank Details:</strong></p>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    <li><strong>Bank:</strong> Commercial Bank of Ceylon</li>
                                    <li><strong>Account Name:</strong> One Promise Wedding (Pvt) Ltd</li>
                                    <li><strong>Account Number:</strong> 8012345678</li>
                                    <li><strong>Branch:</strong> Colombo Fort</li>
                                </ul>
                            </div>
                            
                            <p>Once you have made the transfer, please <strong>upload a clear photo/screenshot of the bank receipt</strong> to your personalized tracking portal using the button below.</p>
                        `,
                        ctaText: 'Upload Payment Proof',
                        ctaUrl: `${frontendUrl}/portal/tracking/${updatedOrder.trackingToken}`
                    })
                });

                // To Admin
                await sendEmail({
                    email: process.env.EMAIL_USER!,
                    subject: `URGENT: Agreement Signed - ${updatedOrder.orderNumber}`,
                    message: `Admin Notice, Client ${updatedOrder.clientInfo.name} has just signed the agreement for Order ${updatedOrder.orderNumber}.`,
                    html: generateEmailHtml({
                        title: 'New Signed Agreement',
                        content: `<p>Admin Notice,</p><p>Client <strong>${updatedOrder.clientInfo.name}</strong> has just signed the agreement for Order <strong>${updatedOrder.orderNumber}</strong>.</p><p>Please check the admin dashboard to review the details and wait for payment proof.</p>`,
                        ctaText: 'Review Order',
                        ctaUrl: `${frontendUrl}/admin/reports`
                    })
                });
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating agreement:", error);
        res.status(400).json({ message: 'Invalid agreement data' });
    }
};

// @desc    Confirm payment / Upload proof
export const confirmPayment = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const oldStatus = order.status;
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
            if (!order.progress) {
                // Initialize with required currentStep if missing
                order.progress = { currentStep: req.body.progress.currentStep || 1 };
            }
            Object.assign(order.progress, req.body.progress);
        }

        const oldStep = order.progress?.currentStep || 0;
        const updatedOrder = await order.save();

        // Trigger: Progress Tracker Milestone Update (Synced)
        if (updatedOrder.clientInfo.email) {
            const newStep = updatedOrder.progress?.currentStep || 0;
            if (newStep !== oldStep && newStep > 0) {
                const stepNames: { [key: number]: string } = {
                    1: "Agreement & Payment",
                    2: "Event Day (Live)",
                    3: "Media Ingested",
                    4: "Sneak Peek Selection",
                    5: "Sneak Peek Delivered",
                    6: "Full Gallery Culling",
                    7: "Color Grading & Editing",
                    8: "Final Gallery Delivery",
                    9: "Album Design (Optional)",
                    10: "Archive & Complete"
                };

                const milestoneName = stepNames[newStep] || `Step ${newStep}`;
                await sendEmail({
                    email: updatedOrder.clientInfo.email,
                    subject: `Milestone Update: Your Wedding Media - Step ${newStep}`,
                    message: `Hello ${updatedOrder.clientInfo.name}, your wedding media progress has reached: ${milestoneName}.`,
                    html: generateEmailHtml({
                        title: 'New Milestone Reached!',
                        preheader: `Progress Update: ${milestoneName}`,
                        content: `
                            <p>Hello ${updatedOrder.clientInfo.name},</p>
                            <p>Great news! Your wedding journey has moved forward.</p>
                            <div style="background-color: #f0f7ff; border-left: 4px solid #467889; padding: 20px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #666;">Current Stage:</p>
                                <h3 style="margin: 5px 0 0 0; color: #1a1a1a;">Step ${newStep}: ${milestoneName}</h3>
                            </div>
                            <p>We are dedicated to capturing and processing your memories with the utmost care. Log in to your portal to see more details.</p>
                        `,
                        ctaText: 'Open Tracking Portal',
                        ctaUrl: `${process.env.FRONTEND_URL}/portal/tracking/${updatedOrder.trackingToken}`
                    })
                });
            }
        }

        // Trigger 3: Payment Verified
        if (updatedOrder.status === 'Confirmed' && oldStatus !== 'Confirmed' && updatedOrder.clientInfo.email) {
            await sendEmail({
                email: updatedOrder.clientInfo.email,
                subject: `Order Confirmed: Payment Verified - ${updatedOrder.orderNumber}`,
                message: `Hello ${updatedOrder.clientInfo.name}, your payment is verified.`,
                html: generateEmailHtml({
                    title: 'Booking Confirmed!',
                    content: `<p>Hello ${updatedOrder.clientInfo.name},</p><p>Great news! Your payment has been verified and your booking (Order <strong>#${updatedOrder.orderNumber}</strong>) is now officially <strong>CONFIRMED</strong>.</p><p>We are excited to be part of your special day!</p>`,
                    ctaText: 'View Dashboard',
                    ctaUrl: `${process.env.FRONTEND_URL}/portal/tracking/${updatedOrder.trackingToken}`
                })
            });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(400).json({ message: 'Invalid payment data' });
    }
};

// @desc    Upload payment proof to Cloudinary
export const uploadProof = async (req: any, res: Response) => {
    console.log('Upload Request Received');
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File details:', req.file.originalname, req.file.mimetype);

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

        // Feature: Admin Notification for Payment Proof
        // Alerts the studio team that a client has submitted a receipt for verification.
        await sendEmail({
            email: process.env.EMAIL_USER!,
            subject: `Action Required: New Payment Proof - ${order.orderNumber}`,
            message: `Admin Notice, Client ${order.clientInfo.name} has uploaded a payment proof.`,
            html: generateEmailHtml({
                title: 'New Payment Submission',
                content: `<p>Admin Notice,</p><p>Client <strong>${order.clientInfo.name}</strong> has uploaded a payment proof for Order <strong>${order.orderNumber}</strong>.</p><p>Please review the attachment and verify the transaction in the dashboard.</p>`,
                ctaText: 'Review Proof',
                ctaUrl: result.secure_url
            })
        });

        res.json({
            success: true,
            url: result.secure_url
        });
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
    }
};
