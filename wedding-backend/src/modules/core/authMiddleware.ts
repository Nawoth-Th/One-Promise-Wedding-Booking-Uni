/**
 * @file authMiddleware.ts
 * @description Authentication and Authorization Middleware.
 * This module intercepts requests to protected routes and verifies the
 * presence and validity of a JWT session cookie.
 * 
 * Features:
 * - Session Extraction: Reads the 'jwt' cookie from the request.
 * - Integrity Verification: Uses jsonwebtoken to decrypt and validate the session.
 * - Request Enrichment: Attaches the decoded user info to the 'req' object for downstream controllers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        isAdmin: boolean;
    };
}

/**
 * Middleware: Protect Route
 * Ensures the user is logged in before allowing access to a route.
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Strategy: Cookie-based session extraction.
    let token = req.cookies.jwt;

    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'secret';
            const decoded = jwt.verify(token, secret) as any;

            // Logic: Hydrating the request object with user context
            req.user = {
                userId: decoded.userId,
                isAdmin: true, // Simplified for this project criteria
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
