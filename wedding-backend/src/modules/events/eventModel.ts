import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    type: 'manual';
}

const eventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        type: { type: String, default: 'manual' },
    },
    {
        timestamps: true,
    }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
