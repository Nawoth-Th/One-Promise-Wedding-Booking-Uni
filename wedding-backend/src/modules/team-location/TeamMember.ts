/**
 * @file TeamMember.ts
 * @description Data model for staff members and photographers.
 * Stores contact info, roles, and availability status for the booking system.
 * 
 * Features:
 * - Role-based assignments.
 * - Automatic phone number sanitization.
 * - Validation patterns for academic data integrity.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * ITeamMember Interface
 */
export interface ITeamMember extends Document {
    name: string;   // Full name of the team member
    role: string;   // Professional role (e.g., "Photographer", "Editor")
    email: string;  // Contact email for automated notifications
    phone: string;  // Contact phone number
    active: boolean; // Toggle for administrative control
}

const teamMemberSchema = new Schema<ITeamMember>(
    {
        name: { 
            type: String, 
            required: [true, "Name is required"],
            match: [/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"]
        },
        role: { type: String, required: true },
        email: { type: String, required: true },
        phone: { 
            type: String, 
            required: [true, "Phone is required"],
            match: [/^\d+$/, "Phone number must contain only digits"]
        },
        active: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware: Pre-validate hook for phone normalization.
 * Ensures all staff phone numbers are stored as pure numeric strings.
 */
teamMemberSchema.pre('validate', function (this: any) {
    if (this.phone) {
        this.phone = this.phone.replace(/\D/g, '');
    }
});

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
