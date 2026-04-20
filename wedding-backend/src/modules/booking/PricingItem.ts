/**
 * @file PricingItem.ts
 * @description Model for storing pricing configurations for various event packages and addons.
 * This allows the administrative team to dynamically update prices without redeploying the code.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * IPricingItem Interface
 * Represents a single billable item or package.
 */
export interface IPricingItem extends Document {
    name: string;      // Name of the package (e.g., "Silver Package")
    price: number;     // Standard price for this item
    category: string;  // Category (e.g., "Wedding", "Addon")
    details?: string[]; // Array of feature descriptions
}

const pricingItemSchema = new Schema<IPricingItem>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        details: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

export const PricingItem = mongoose.model<IPricingItem>('PricingItem', pricingItemSchema);
