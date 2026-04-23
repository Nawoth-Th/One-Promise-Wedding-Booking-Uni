/**
 * @file assignmentController.ts
 * @description Logic for managing staff assignments and availability.
 * This is a critical module for operational scheduling, ensuring no team member
 * is double-booked across different orders.
 * 
 * Features:
 * - Real-time Availability Check: Queries all orders to find busy staff.
 * - Assignment Overlap Validation: Prevents assigning a busy person to a new event.
 * - Automated Staff Notification: Sends emails to newly assigned team members.
 */

import { Request, Response } from 'express';
import { Order } from '../booking/Order';
import { TeamMember } from '../team-location/TeamMember';
import { sendEmail } from '../../utils/sendEmail';
import { generateEmailHtml } from '../../utils/emailTemplate';
import { format } from 'date-fns';

/**
 * @desc    Get busy team members for a specific date.
 * @route   GET /api/availability?date=YYYY-MM-DD
 * @access  Internal (Used by Assignment Dashboard)
 */
export const getAvailability = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const targetDate = new Date(date as string);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Feature: Cross-Collection Querying
        // Finds all orders where any event (Wedding, HC, etc.) lands on this date.
        const orders = await Order.find({
            $or: [
                { 'wedding.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'homecoming.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'engagement.date': { $gte: startOfDay, $lte: endOfDay } },
                { 'preShoot.date': { $gte: startOfDay, $lte: endOfDay } }
            ]
        });

        // Strategy: Unique Set Aggregation
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

// @desc    Assign team members to events
export const updateAssignments = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

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

        // Update assignments
        if (req.body.assignments) order.assignments = { ...order.assignments, ...req.body.assignments };
        const updatedOrder = await order.save();

        // Handle Email Notifications for NEW assignments (Member 4 - You)
        if (req.body.assignments) {
            const events: ("wedding" | "homecoming" | "engagement" | "preShoot")[] = ["wedding", "homecoming", "engagement", "preShoot"];
            for (const eventType of events) {
                const newIds = req.body.assignments[eventType] || [];
                const oldIds = oldAssignments[eventType] || [];
                const addedIds = newIds.filter((id: string) => !oldIds.includes(id));

                if (addedIds.length > 0) {
                    const eventDate = updatedOrder[eventType]?.date;
                    for (const memberId of addedIds) {
                        const member = await TeamMember.findById(memberId);
                        if (member && member.email) {
                            const dateStr = eventDate ? format(new Date(eventDate), 'PPP') : 'TBD';
                            await sendEmail({
                                email: member.email,
                                subject: `New Assignment: ${eventType.toUpperCase()} - ${updatedOrder.orderNumber}`,
                                message: `Hello ${member.name}, you have been assigned to ${eventType.toUpperCase()} on ${dateStr}.`,
                                html: generateEmailHtml({
                                    title: 'New Staff Assignment',
                                    content: `
                                        <p>Hello ${member.name},</p>
                                        <p>You have been officially assigned to the following event:</p>
                                        <div style="background-color: #fafaFA; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
                                            <p style="margin: 0;"><strong>Event:</strong> ${eventType.toUpperCase()}</p>
                                            <p style="margin: 5px 0 0 0;"><strong>Client:</strong> ${updatedOrder.clientInfo.name}</p>
                                            <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${dateStr}</p>
                                            <p style="margin: 5px 0 0 0;"><strong>Order:</strong> ${updatedOrder.orderNumber}</p>
                                        </div>
                                        <p>Please check the admin portal for full details.</p>
                                    `
                                })
                            });
                        }
                    }
                }
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Invalid assignment data' });
    }
};

/**
 * Utility: Date Comparison
 * Logic: Checks if two dates fallback on the same calendar day irrespective of time.
 */
const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}
