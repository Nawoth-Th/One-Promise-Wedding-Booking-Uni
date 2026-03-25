import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { TeamMember } from '../models/TeamMember';
import { sendEmail } from '../utils/sendEmail';
import { format } from 'date-fns';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
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
// @access  Private (or public with portal/tracking token)
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

// @desc    Get order by Tracking/Portal/Agreement Token
// @route   GET /api/orders/token/:tokenType/:token
// @access  Public
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
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const order = new Order({
            ...req.body,
            // Generate some tokens for tracking if not provided
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
// @access  Private (or public for specific fields like agreement signing)
export const updateOrder = async (req: Request, res: Response) => {
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

            // Update fields simply by assigning from req.body (merging existing)
            Object.assign(order, req.body);
            
            // Handle nested objects safely if needed
            if (req.body.clientInfo) order.clientInfo = { ...order.clientInfo, ...req.body.clientInfo };
            if (req.body.eventDetails) order.eventDetails = { ...order.eventDetails, ...req.body.eventDetails };
            if (req.body.financials) order.financials = { ...order.financials, ...req.body.financials };
            if (req.body.progress) order.progress = { ...order.progress, ...req.body.progress };
            if (req.body.agreementDetails) order.agreementDetails = { ...order.agreementDetails, ...req.body.agreementDetails };
            if (req.body.assignments) order.assignments = { ...order.assignments, ...req.body.assignments };

            const updatedOrder = await order.save();

            // Handle Email Notifications for NEW assignments
            if (req.body.assignments) {
                const events: ("wedding" | "homecoming" | "engagement" | "preShoot")[] = ["wedding", "homecoming", "engagement", "preShoot"];
                
                for (const eventType of events) {
                    const newIds = req.body.assignments[eventType] || [];
                    const oldIds = oldAssignments[eventType] || [];
                    const addedIds = newIds.filter((id: string) => !oldIds.includes(id));

                    if (addedIds.length > 0) {
                        const eventDate = updatedOrder[eventType]?.date;
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
        console.error(error);
        res.status(400).json({ message: 'Invalid order data' });
    }
};

// @desc    Get busy team members for a specific date
// @route   GET /api/orders/availability
// @access  Private
export const getAvailability = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            $or: [
                { 'wedding.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'homecoming.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'engagement.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'preShoot.date': { $gte: startOfDay, $lte: endOfDay } }
            ]
        });

        const busyMemberIds = new Set<string>();
        orders.forEach(order => {
            if (order.wedding?.date && isSameDay(order.wedding.date, targetDate)) {
                order.assignments?.wedding?.forEach(id => busyMemberIds.add(id));
            }
            if (order.homecoming?.date && isSameDay(order.homecoming.date, targetDate)) {
                order.assignments?.homecoming?.forEach(id => busyMemberIds.add(id));
            }
            if (order.engagement?.date && isSameDay(order.engagement.date, targetDate)) {
                order.assignments?.engagement?.forEach(id => busyMemberIds.add(id));
            }
            if (order.preShoot?.date && isSameDay(order.preShoot.date, targetDate)) {
                order.assignments?.preShoot?.forEach(id => busyMemberIds.add(id));
            }
        });

        res.json(Array.from(busyMemberIds));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
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
