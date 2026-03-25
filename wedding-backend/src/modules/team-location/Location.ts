import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    googleMapLink?: string;
    province: string;
    district: string;
}

const locationSchema = new Schema<ILocation>(
    {
        name: { type: String, required: true },
        googleMapLink: { 
            type: String,
            match: [/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link"]
        },
        province: { type: String, required: true },
        district: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Optional: Add index for faster searching
locationSchema.index({ province: 1, district: 1 });

export const Location = mongoose.model<ILocation>('Location', locationSchema);
