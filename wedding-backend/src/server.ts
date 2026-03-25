import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';

// Modular Route imports
import authRoutes from './modules/core/authRoutes';
import bookingRoutes from './modules/booking/bookingRoutes';
import agreementRoutes from './modules/agreement/agreementRoutes';
import eventRoutes from './modules/events/eventRoutes';
import teamLocationRoutes from './modules/team-location/teamLocationRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Mount Modular Routers
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);       // Component 01
app.use('/api/agreement', agreementRoutes);   // Component 02
app.use('/api/events', eventRoutes);         // Component 03
app.use('/api/team-location', teamLocationRoutes); // Component 04 & Base

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('API is running in Modular Mode...');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Modular Architecture)`);
});
