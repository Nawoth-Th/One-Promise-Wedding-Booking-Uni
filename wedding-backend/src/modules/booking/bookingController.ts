/**
 * @file bookingController.ts
 * @description Controller responsible for managing Orchestration of Order/Booking lifecycle.
 * This file contains the primary 'Business Logic' layer for the booking system,
 * including date clash detection, sequential ID assignment, and assignment notifications.
 * 
 * Features:
 * - RESTful API handlers for Orders.
 * - Calendar clash detection (preventing double bookings with manual events).
 * - Automated token generation for client portals and tracking.
 * - Shift assignment notification system via Email.
 */

import { Request, Response } from 'express';
import { Order } from './Order';
import { Event } from '../events/eventModel';
import { TeamMember } from '../team-location/TeamMember';
import { sendEmail } from '../../utils/sendEmail';
import { format } from 'date-fns';

/**
 * @desc    Get the next sequential order number based on the current year.
 * @route   GET /api/booking/latest-number
 * @access  Private/Admin
 */
export const getLatestOrderNumber = async (req: Request, res: Response) => {
    try {
        // Strategy: Delegate ID generation logic to the Model Layer (Encapsulation)
        const nextOrderNumber = await (Order as any).getNextOrderNumber();
        res.json({ nextOrderNumber });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Retrieve all orders sorted by creation date.
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get order by Token
export const getOrderByToken = async (req: Request, res: Response) => {
    try {
        const { tokenType, token } = req.params;
        let query: any = {};
        
        if (tokenType === 'portal') query.portalToken = token;
        else if (tokenType === 'tracking') query.trackingToken = token;
        else if (tokenType === 'agreement') query.agreementToken = token;
        else return res.status(400).json({ message: 'Invalid token type' });

        const order = await Order.findOne(query);
        if (order) {
            // Feature: Auto-tracking - Update status to 'Sent' when link is accessed
            if (tokenType === 'agreement' && order.agreementStatus === 'Not Sent') {
                order.agreementStatus = 'Sent';
                await order.save();
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Create a new order from a public or admin form.
 * @route   POST /api/orders
 * @access  Public/Admin
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { wedding, homecoming, engagement, preShoot } = req.body;
        
        // Feature: Date Conflict Validation
        // Collect all dates from the request to check for existing blocks in the calendar.
        const datesToCheck = [
            wedding?.date,
            homecoming?.date,
            engagement?.date,
            preShoot?.date
        ].filter(Boolean);

        for (const date of datesToCheck) {
            const eventDate = new Date(date);
            const startOfDay = new Date(eventDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(eventDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Strategy: Cross-Module Query - Checking the 'Events' module for blocked dates
            const manualEvent = await Event.findOne({
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (manualEvent) {
                return res.status(400).json({ 
                    message: `Date ${format(eventDate, 'PPP')} is blocked by a manual event: ${manualEvent.title}` 
                });
            }
        }

        // Logic: Generate tracking, agreement, and portal tokens for secure external access
        const orderNumber = req.body.orderNumber || await (Order as any).getNextOrderNumber();

        const order = new Order({
            ...req.body,
            orderNumber,
            trackingToken: req.body.trackingToken || `tk-${Math.random().toString(36).substr(2, 9)}`,
            agreementToken: req.body.agreementToken || `ag-${Math.random().toString(36).substr(2, 9)}`,
            portalToken: req.body.portalToken || `pt-${Math.random().toString(36).substr(2, 9)}`,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid order data' });
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
export const updateOrder = async (req: Request, res: Response) => {
    console.log(`Updating order ${req.params.id}`, JSON.stringify(req.body, null, 2));
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Store old assignments for change detection
            const oldAssignments = { ...(order.assignments || {}) };

            // Overlap Validation for assignments
            if (req.body.assignments) {
                const newAssignments = req.body.assignments;
                const events: ("wedding" | "homecoming" | "engagement" | "preShoot")[] = ["wedding", "homecoming", "engagement", "preShoot"];
                
                for (const eventType of events) {
                    const memberIds = newAssignments[eventType];
                    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) continue;

                    const eventDate = (req.body[eventType]?.date || order[eventType]?.date);
                    if (!eventDate) continue;

                    const targetDate = new Date(eventDate);
                    targetDate.setHours(0, 0, 0, 0);

                    // Check for overlaps in other orders
                    const startOfDay = new Date(targetDate);
                    const endOfDay = new Date(targetDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    const overlappingOrders = await Order.find({
                        _id: { $ne: order._id },
                        $or: [
                            { 'wedding.date': { $gte: startOfDay, $lte: endOfDay }, 'assignments.wedding': { $in: memberIds } },
                            { 'homecoming.date': { $gte: startOfDay, $lte: endOfDay }, 'assignments.homecoming': { $in: memberIds } },
                            { 'engagement.date': { $gte: startOfDay, $lte: endOfDay }, 'assignments.engagement': { $in: memberIds } },
                            { 'preShoot.date': { $gte: startOfDay, $lte: endOfDay }, 'assignments.preShoot': { $in: memberIds } }
                        ]
                    });

                    if (overlappingOrders.length > 0) {
                        return res.status(400).json({ 
                            message: `Overlap detected: One or more members are already assigned to Order ${overlappingOrders[0].orderNumber} on this date.`,
                            details: overlappingOrders.map(o => ({ orderNumber: o.orderNumber, date: targetDate }))
                        });
                    }
                }
            }

            // Update top-level fields (non-nested)
            const topLevelFields = ['status', 'orderNumber', 'trackingToken', 'agreementToken', 'portalToken', 'agreementStatus', 'generalAddons'];
            topLevelFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    (order as any)[field] = req.body[field];
                }
            });

            // Handle nested objects safely
            if (req.body.clientInfo) {
                Object.assign(order.clientInfo, req.body.clientInfo);
            }
            if (req.body.eventDetails) Object.assign(order.eventDetails, req.body.eventDetails);
            if (req.body.wedding) {
                if (req.body.wedding.date && new Date(req.body.wedding.date).getTime() !== new Date(order.wedding?.date || 0).getTime()) {
                    const eventDate = new Date(req.body.wedding.date);
                    const start = new Date(eventDate); start.setHours(0,0,0,0);
                    const end = new Date(eventDate); end.setHours(23,59,59,999);
                    const manualBlock = await Event.findOne({ date: { $gte: start, $lte: end } });
                    if (manualBlock) return res.status(400).json({ message: `Wedding date is blocked by manual event: ${manualBlock.title}` });
                }
                Object.assign((order as any).wedding || (order.wedding = {}), req.body.wedding);
            }
            if (req.body.homecoming) {
                if (req.body.homecoming.date && new Date(req.body.homecoming.date).getTime() !== new Date(order.homecoming?.date || 0).getTime()) {
                    const eventDate = new Date(req.body.homecoming.date);
                    const start = new Date(eventDate); start.setHours(0,0,0,0);
                    const end = new Date(eventDate); end.setHours(23,59,59,999);
                    const manualBlock = await Event.findOne({ date: { $gte: start, $lte: end } });
                    if (manualBlock) return res.status(400).json({ message: `Homecoming date is blocked by manual event: ${manualBlock.title}` });
                }
                Object.assign((order as any).homecoming || (order.homecoming = {}), req.body.homecoming);
            }
            if (req.body.engagement) {
                if (req.body.engagement.date && new Date(req.body.engagement.date).getTime() !== new Date(order.engagement?.date || 0).getTime()) {
                    const eventDate = new Date(req.body.engagement.date);
                    const start = new Date(eventDate); start.setHours(0,0,0,0);
                    const end = new Date(eventDate); end.setHours(23,59,59,999);
                    const manualBlock = await Event.findOne({ date: { $gte: start, $lte: end } });
                    if (manualBlock) return res.status(400).json({ message: `Engagement date is blocked by manual event: ${manualBlock.title}` });
                }
                Object.assign((order as any).engagement || (order.engagement = {}), req.body.engagement);
            }
            if (req.body.preShoot) {
                if (req.body.preShoot.date && new Date(req.body.preShoot.date).getTime() !== new Date(order.preShoot?.date || 0).getTime()) {
                    const eventDate = new Date(req.body.preShoot.date);
                    const start = new Date(eventDate); start.setHours(0,0,0,0);
                    const end = new Date(eventDate); end.setHours(23,59,59,999);
                    const manualBlock = await Event.findOne({ date: { $gte: start, $lte: end } });
                    if (manualBlock) return res.status(400).json({ message: `Pre-shoot date is blocked by manual event: ${manualBlock.title}` });
                }
                Object.assign((order as any).preShoot || (order.preShoot = {}), req.body.preShoot);
            }
            
            if (req.body.financials) {
                const fin = req.body.financials;
                if (fin.paymentProof) {
                    order.financials.paymentProof = {
                        ...(order.financials.paymentProof || {}),
                        ...fin.paymentProof
                    };
                }
                // Update other financial fields
                Object.keys(fin).forEach(key => {
                    if (key !== 'paymentProof') {
                        (order.financials as any)[key] = fin[key];
                    }
                });
                order.markModified('financials');
            }
            
            if (req.body.progress) {
                if (!order.progress) order.progress = { currentStep: 1, history: [] };
                Object.assign(order.progress, req.body.progress);
            }
            if (req.body.agreementDetails) {
                if (!order.agreementDetails) order.agreementDetails = {};
                Object.assign(order.agreementDetails, req.body.agreementDetails);
            }
            
            if (req.body.assignments) {
                order.assignments = { ...order.assignments, ...req.body.assignments };
                order.markModified('assignments');
            }

            const updatedOrder = await order.save();

            // Handle Email Notifications for NEW assignments
            if (req.body.assignments) {
                const events: ("wedding" | "homecoming" | "engagement" | "preShoot")[] = ["wedding", "homecoming", "engagement", "preShoot"];
                
                for (const eventType of events) {
                    const newIds = req.body.assignments[eventType] || [];
                    const oldIds = oldAssignments[eventType] || [];
                    const addedIds = newIds.filter((id: string) => !oldIds.includes(id));

                    if (addedIds.length > 0) {
                        const eventDate = (updatedOrder as any)[eventType]?.date;
                        const clientName = updatedOrder.clientInfo.name;
                        const orderNum = updatedOrder.orderNumber;

                        for (const memberId of addedIds) {
                            const member = await TeamMember.findById(memberId);
                            if (member && member.email) {
                                const dateStr = eventDate ? format(new Date(eventDate), 'PPP') : 'TBD';
                                await sendEmail({
                                    email: member.email,
                                    subject: `New Assignment: ${eventType.toUpperCase()} - ${orderNum}`,
                                    message: `Hello ${member.name},\n\nYou have been assigned to a new event.\n\nEvent Type: ${eventType.toUpperCase()}\nOrder: ${orderNum}\nClient: ${clientName}\nDate: ${dateStr}\n\nPlease check the admin portal for more details.\n\nBest regards,\nNawography Team`
                                });
                            }
                        }
                    }
                }
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(400).json({ message: 'Invalid order data', error: (error as any).message });
    }
};

// @desc    Delete order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (order) {
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
