import { Request, Response } from 'express';
import { PricingItem } from './PricingItem';

// @desc    Get all pricing items
// @route   GET /api/pricing
// @access  Public
export const getPricingItems = async (req: Request, res: Response) => {
    try {
        const items = await PricingItem.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a pricing item
// @route   POST /api/pricing
// @access  Private
export const createPricingItem = async (req: Request, res: Response) => {
    try {
        const item = new PricingItem(req.body);
        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid pricing item data' });
    }
};

// @desc    Update a pricing item
// @route   PUT /api/pricing/:id
// @access  Private
export const updatePricingItem = async (req: Request, res: Response) => {
    try {
        const item = await PricingItem.findById(req.params.id);

        if (item) {
            item.name = req.body.name || item.name;
            item.price = req.body.price || item.price;
            item.category = req.body.category || item.category;
            item.details = req.body.details || item.details;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Pricing item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete a pricing item
// @route   DELETE /api/pricing/:id
// @access  Private
export const deletePricingItem = async (req: Request, res: Response) => {
    try {
        const item = await PricingItem.findByIdAndDelete(req.params.id);

        if (item) {
            res.json({ message: 'Pricing item removed' });
        } else {
            res.status(404).json({ message: 'Pricing item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
