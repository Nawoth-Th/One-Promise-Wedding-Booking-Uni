import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember extends Document {
    name: string;
    role: string;
    email: string;
    phone: string;
    active: boolean;
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

teamMemberSchema.pre('validate', function (this: any) {
    if (this.phone) {
        this.phone = this.phone.replace(/\D/g, '');
    }
});

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
