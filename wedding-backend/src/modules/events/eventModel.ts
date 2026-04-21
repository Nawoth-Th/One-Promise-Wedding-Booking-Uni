/**
 * @file eventModel.ts
 * @description Data model for Manual Calendar Events.
 * These are used to block dates in the calendar for internal tasks, holidays, or
 * tentative bookings that haven't been finalized as full 'Orders'.
 * 
 * Features:
 * - Date Blocking: Used by the booking controller to prevent clashing orders.
 * - Team Assignment: Link specific staff members to manual events.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * IEvent Interface
 * Defines the structure for manually created events.
 */
export interface IEvent extends Document {
    title: string;        // Name of the event (e.g., "Camera Maintenance Day")
    description?: string; // Optional context
    date: Date;           // The blocked date
    type: 'manual';      // Differentiator for the calendar view
    assignedTeam?: mongoose.Types.ObjectId[]; // Staff needed for this task
}

const eventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        type: { type: String, default: 'manual' },
        assignedTeam: [{ type: Schema.Types.ObjectId, ref: 'TeamMember' }],
    },
    {
        timestamps: true,
    }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
