import { Request, Response } from 'express';
import { Order } from '../booking/Order';

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
