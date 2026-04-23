/**
 * @file Location.ts
 * @description Data model for the Venue Library.
 * Stores geographically categorized wedding venues in Sri Lanka to assist 
 * users during the booking process.
 * 
 * Features:
 * - Google Maps integration validation.
 * - Geographic categorization (Province/District).
 * - Optimized indexing for region-based searches.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * ILocation Interface
 */
export interface ILocation extends Document {
    name: string;          // Name of the hotel, resort, or shoot location
    googleMapLink?: string; // Verified maps URL
    province: string;      // Regional categorization (e.g., "Western")
    district: string;      // Specific district (e.g., "Colombo")
}

const locationSchema = new Schema<ILocation>(
    {
        name: { type: String, required: true },
        googleMapLink: { 
            type: String,
            // Logic: This field is optional. If provided, it must match the Google Maps format.
            // If empty, the controller handles converting it to undefined to skip this check.
            match: [/google\.com\/maps|goo\.gl\/maps|maps\.google\.com/, "Must be a valid Google Maps link"]
        },
        province: { type: String, required: true },
        district: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

/**
 * Performance Optimization: Composite Index
 * Feature: Indexed Search.
 * Ensures that filtering venues by province and district is extremely performant
 * as the venue database grows.
 */
locationSchema.index({ province: 1, district: 1 });

export const Location = mongoose.model<ILocation>('Location', locationSchema);
