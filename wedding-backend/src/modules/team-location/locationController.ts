/**
 * @file locationController.ts
 * @description Controller responsible for managing the Venue Library.
 * Provides capabilities to list, add, update, and remove locations that 
 * populate the frontend location picker.
 */

import { Request, Response } from 'express';
import { Location } from './Location';

/**
 * @desc    Fetch all saved locations sorted by region and name.
 * @route   GET /api/locations
 * @access  Public (Used by the booking form)
 */
export const getLocations = async (req: Request, res: Response): Promise<void> => {
    try {
        // Logic: Sorted retrieval for easier consumption by the frontend UI
        const locations = await Location.find().sort({ province: 1, district: 1, name: 1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Add a new venue to the library.
 * @route   POST /api/locations
 * @access  Private/Admin
 */
export const addLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, googleMapLink, province, district } = req.body;
        const newLocation = new Location({ name, googleMapLink, province, district });
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        res.status(400).json({ message: 'Error adding location', error });
    }
};

export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await Location.findByIdAndDelete(id);
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting location', error });
    }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedLocation = await Location.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedLocation) {
            res.status(404).json({ message: 'Location not found' });
            return;
        }
        res.json(updatedLocation);
    } catch (error) {
        res.status(400).json({ message: 'Error updating location', error });
    }
};
