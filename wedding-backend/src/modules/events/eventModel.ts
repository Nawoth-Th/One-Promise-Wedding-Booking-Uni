import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    type: 'manual';
    assignedTeam?: mongoose.Types.ObjectId[];
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
