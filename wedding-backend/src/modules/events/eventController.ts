import { Request, Response } from 'express';
import { Order } from '../booking/Order';
import { Event } from './eventModel';
import { startOfDay, endOfDay } from 'date-fns';

// @desc    Get all events (Orders + Manual)
export const getEvents = async (req: Request, res: Response) => {
    try {
        // Fetch all non-cancelled orders
        const orders = await Order.find({ status: { $ne: 'Cancelled' } });
        
        // Extract dates from orders
        const orderEvents: any[] = [];
        orders.forEach(order => {
            const clientName = order.clientInfo.name;
            
            if (order.wedding?.date) {
                orderEvents.push({
                    id: `${order._id}-wedding`,
                    title: `Wedding: ${clientName}`,
                    date: order.wedding.date,
                    type: 'order',
                    orderId: order._id,
                    eventType: 'Wedding'
                });
            }
            if (order.homecoming?.date) {
                orderEvents.push({
                    id: `${order._id}-homecoming`,
                    title: `Homecoming: ${clientName}`,
                    date: order.homecoming.date,
                    type: 'order',
                    orderId: order._id,
                    eventType: 'Homecoming'
                });
            }
            if (order.engagement?.date) {
                orderEvents.push({
                    id: `${order._id}-engagement`,
                    title: `Engagement: ${clientName}`,
                    date: order.engagement.date,
                    type: 'order',
                    orderId: order._id,
                    eventType: 'Engagement'
                });
            }
            if (order.preShoot?.date) {
                orderEvents.push({
                    id: `${order._id}-preshoot`,
                    title: `Pre-shoot: ${clientName}`,
                    date: order.preShoot.date,
                    type: 'order',
                    orderId: order._id,
                    eventType: 'Pre-shoot'
                });
            }
        });

        // Fetch manual events
        const manualEvents = await Event.find();
        const formattedManualEvents = manualEvents.map(e => ({
            id: e._id,
            title: e.title,
            date: e.date,
            type: 'manual',
            description: e.description
        }));

        res.json([...orderEvents, ...formattedManualEvents]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
};

// @desc    Create a manual event
export const createManualEvent = async (req: Request, res: Response) => {
    try {
        const { title, date, description } = req.body;
        const eventDate = new Date(date);

        // Overlap Check 1: Other manual events on same day
        const existingManual = await Event.findOne({
            date: {
                $gte: startOfDay(eventDate),
                $lte: endOfDay(eventDate)
            }
        });

        if (existingManual) {
            return res.status(400).json({ message: 'Date already occupied by a manual event' });
        }

        // Overlap Check 2: Orders on same day
        const existingOrder = await Order.findOne({
            $or: [
                { 'wedding.date': { $gte: startOfDay(eventDate), $lte: endOfDay(eventDate) } },
                { 'homecoming.date': { $gte: startOfDay(eventDate), $lte: endOfDay(eventDate) } },
                { 'engagement.date': { $gte: startOfDay(eventDate), $lte: endOfDay(eventDate) } },
                { 'preShoot.date': { $gte: startOfDay(eventDate), $lte: endOfDay(eventDate) } }
            ],
            status: { $ne: 'Cancelled' }
        });

        if (existingOrder) {
            return res.status(400).json({ message: `Date already occupied by an order (${existingOrder.orderNumber})` });
        }

        const newEvent = new Event({ title, date: eventDate, description });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: 'Invalid event data' });
    }
};

// @desc    Delete a manual event
export const deleteManualEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
};

// @desc    Update event details (date, venue, etc.)
export const updateEventDetails = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update event specific fields
        if (req.body.wedding) {
            if (!order.wedding) order.wedding = {};
            Object.assign(order.wedding, req.body.wedding);
        }
        if (req.body.homecoming) {
            if (!order.homecoming) order.homecoming = {};
            Object.assign(order.homecoming, req.body.homecoming);
        }
        if (req.body.engagement) {
            if (!order.engagement) order.engagement = {};
            Object.assign(order.engagement, req.body.engagement);
        }
        if (req.body.preShoot) {
            if (!order.preShoot) order.preShoot = {};
            Object.assign(order.preShoot, req.body.preShoot);
        }
        if (req.body.eventDetails) {
            if (!order.eventDetails) order.eventDetails = { locations: [] };
            Object.assign(order.eventDetails, req.body.eventDetails);
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Invalid event data' });
    }
};

// @desc    Sync with Google Calendar (Placeholder for Member 3)
export const syncCalendar = async (req: Request, res: Response) => {
    try {
        // Logic for Google Calendar integration would go here
        res.json({ message: 'Calendar sync initiated (Component 03)' });
    } catch (error) {
        res.status(500).json({ message: 'Calendar sync failed' });
    }
};
