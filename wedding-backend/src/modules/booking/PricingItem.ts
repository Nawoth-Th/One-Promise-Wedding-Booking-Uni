import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingItem extends Document {
    name: string;
    price: number;
    category: string;
    details?: string[];
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
