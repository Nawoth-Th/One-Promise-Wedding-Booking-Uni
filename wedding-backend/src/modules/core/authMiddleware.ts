import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        isAdmin: boolean;
    };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'secret';
            const decoded = jwt.verify(token, secret) as any;

            req.user = {
                userId: decoded.userId,
                isAdmin: true, // Simplified for this project
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
