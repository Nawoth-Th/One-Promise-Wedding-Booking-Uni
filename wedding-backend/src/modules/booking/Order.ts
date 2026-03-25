import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type AgreementStatus = "Not Sent" | "Sent" | "Signed" | "Reviewing" | "Completed";

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
                match: [/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"]
            },
            phone: { 
                type: String, 
                required: [true, "Phone is required"],
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

orderSchema.pre('validate', function (this: any) {
    if (this.clientInfo && this.clientInfo.phone) {
        this.clientInfo.phone = this.clientInfo.phone.replace(/\D/g, '');
    }
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
