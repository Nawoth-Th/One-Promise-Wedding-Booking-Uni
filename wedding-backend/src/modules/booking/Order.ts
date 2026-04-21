/**
 * @file Order.ts
 * @description This file defines the core Data Model for Bookings in the system.
 * It uses Mongoose to manage the MongoDB 'orders' collection, providing type safety,
 * data validation, and automated features like sequential ID generation.
 * 
 * Features:
 * - Dynamic event support (Wedding, Homecoming, Engagement, etc.)
 * - Automatic phone number sanitization via Mongoose hooks.
 * - Sequential Order Number Generation for internal tracking.
 * - Integrated financial and progress tracking.
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Status of the overall booking lifecycle.
 */
export type OrderStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

/**
 * Tracking the legal agreement workflow state.
 */
export type AgreementStatus = "Not Sent" | "Sent" | "Signed" | "Reviewing" | "Completed";

/**
 * IOrder Interface
 * Defines the TypeScript structure for an Order document for full type safety across the app.
 * Extends mongoose.Document to inherit MongoDB utility methods.
 */
export interface IOrder extends Document {
    orderNumber: string;
    trackingToken?: string;
    agreementToken?: string;
    portalToken?: string;
    clientInfo: {
        title?: string;
        name: string;
        phone: string;
        email?: string;
    };
    eventDetails: {
        mainDate?: Date;
        locations?: {
            name: string;
            url?: string;
            forEvent?: string;
            mode?: "library" | "manual";
            province?: string;
            district?: string;
        }[];
        notes?: string;
    };
    wedding?: {
        date?: Date;
        packageType?: string;
        packageDetails?: string;
        addons?: string[];
    };
    homecoming?: {
        date?: Date;
        packageType?: string;
        packageDetails?: string;
        addons?: string[];
    };
    engagement?: {
        date?: Date;
        packageType?: string;
        packageDetails?: string;
        addons?: string[];
    };
    preShoot?: {
        date?: Date;
        packageType?: string;
        packageDetails?: string;
        addons?: string[];
    };
    generalAddons?: string[];

    financials: {
        packagePrice: number;
        transportCost: number;
        discount?: number;
        totalAmount: number;
        balance: number;
        paymentProof?: {
            url: string;
            status: "Pending" | "Verified" | "Rejected";
            uploadedAt: Date;
        };
    };
    status: OrderStatus;

    agreementStatus?: AgreementStatus;
    agreementDetails?: {
        coupleName?: { bride: string; groom: string };
        address?: string;
        phone?: { bride: string; groom: string };
        email?: string;
        referralSource?: string[];
        story?: string;
        signature?: string;
        signedAt?: Date;
    };

    assignments?: {
        wedding?: string[]; // TeamMember ObjectIds as strings
        homecoming?: string[];
        engagement?: string[];
        preShoot?: string[];
        [key: string]: string[] | undefined;
    };

    progress?: {
        currentStep: number;
        lastUpdated?: Date;
        history?: {
            stepId: number;
            timestamp: Date;
        }[];
    };
}

/**
 * Mongoose Schema Definition
 * Translates the IOrder interface into a database-enforced structure with validation rules.
 */
const orderSchema = new Schema<IOrder>(
    {
        orderNumber: { type: String, required: true, unique: true },
        trackingToken: { type: String, unique: true, sparse: true },
        agreementToken: { type: String, unique: true, sparse: true },
        portalToken: { type: String, unique: true, sparse: true },
        clientInfo: {
            title: { type: String },
            name: { 
                type: String, 
                required: [true, "Name is required"],
                // Feature: Data Validation - Ensuring names are alphabetic
                match: [/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"]
            },
            phone: { 
                type: String, 
                required: [true, "Phone is required"],
                // Feature: Data Validation - Ensuring phone numbers are purely numeric after sanitization
                match: [/^\d+$/, "Phone number must contain only digits"]
            },
            email: { type: String },
        },
        eventDetails: {
            mainDate: { type: Date },
            locations: [{ type: Schema.Types.Mixed }],
            notes: { type: String },
        },
        wedding: {
            date: { type: Date },
            packageType: { type: String },
            packageDetails: { type: String },
            addons: [{ type: String }],
        },
        homecoming: {
            date: { type: Date },
            packageType: { type: String },
            packageDetails: { type: String },
            addons: [{ type: String }],
        },
        engagement: {
            date: { type: Date },
            packageType: { type: String },
            packageDetails: { type: String },
            addons: [{ type: String }],
        },
        preShoot: {
            date: { type: Date },
            packageType: { type: String },
            packageDetails: { type: String },
            addons: [{ type: String }],
        },
        generalAddons: [{ type: String }],
        financials: {
            packagePrice: { type: Number, required: true, default: 0 },
            transportCost: { type: Number, required: true, default: 0 },
            discount: { type: Number, default: 0 },
            totalAmount: { type: Number, required: true, default: 0 },
            balance: { type: Number, required: true, default: 0 },
            paymentProof: {
                url: { type: String },
                status: { type: String, enum: ['Pending', 'Verified', 'Rejected'] },
                uploadedAt: { type: Date },
            },
        },
        status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
        agreementStatus: { type: String, enum: ['Not Sent', 'Sent', 'Signed', 'Reviewing', 'Completed'], default: 'Not Sent' },
        agreementDetails: {
            coupleName: {
                bride: { type: String },
                groom: { type: String },
            },
            address: { type: String },
            phone: {
                bride: { type: String },
                groom: { type: String },
            },
            email: { type: String },
            referralSource: [{ type: String }],
            story: { type: String },
            signature: { type: String },
            signedAt: { type: Date },
        },
        assignments: { type: Schema.Types.Mixed }, // Store dynamic assignment dictionary
        progress: {
            currentStep: { type: Number, default: 1 },
            lastUpdated: { type: Date },
            history: [
                {
                    stepId: { type: Number },
                    timestamp: { type: Date },
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware: Pre-validate Hook (Separation of Concerns)
 * Automatically sanitizes data BEFORE it reaches the database.
 * This ensures that phone numbers are stored in a clean, consistent numeric format.
 */
orderSchema.pre('validate', function(this: IOrder) {
    if (this.clientInfo && this.clientInfo.phone) {
        // Feature: Automated Data Sanitization - Stripping non-digit characters
        this.clientInfo.phone = this.clientInfo.phone.replace(/\D/g, '');
    }
    if (this.agreementDetails && this.agreementDetails.phone) {
        if (this.agreementDetails.phone.bride) {
            this.agreementDetails.phone.bride = this.agreementDetails.phone.bride.replace(/\D/g, '');
        }
        if (this.agreementDetails.phone.groom) {
            this.agreementDetails.phone.groom = this.agreementDetails.phone.groom.replace(/\D/g, '');
        }
    }
});

export interface IOrderModel extends mongoose.Model<IOrder> {
    getNextOrderNumber(): Promise<string>;
}

/**
 * Static Method: getNextOrderNumber
 * Feature: Intelligent ID Generation.
 * Queries the latest order record to generate a sequential, human-readable ID
 * formatted as OPW-YYYY-XXX (e.g., OPW-2026-001).
 */
orderSchema.statics.getNextOrderNumber = async function () {
    const currentYear = new Date().getFullYear();
    const prefix = `OPW-${currentYear}-`;

    // Strategy: Database Query - Find the highest current sequence for the year
    const lastOrder = await this.findOne({
        orderNumber: new RegExp(`^${prefix}`)
    }).sort({ orderNumber: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
        if (!isNaN(lastSequence)) {
            nextNumber = lastSequence + 1;
        }
    }

    // Pad with zeros to maintain consistent length (e.g., 001, 002)
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

export const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);
