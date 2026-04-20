import jwt from 'jsonwebtoken';
import { Response } from 'express';

/**
 * generateToken Utility
 * Feature: Secure Authenthication via JWT and HTTP-Only Cookies.
 * 
 * Logic:
 * 1. Signs a JWT containing the user ID.
 * 2. Injects the token into a secure cookie.
 * 3. Configures SameSite and HttpOnly flags for modern security (CSRF/XSS protection).
 * 
 * @param res - Express Response object to attach the cookie to.
 * @param userId - The unique identifier for the user session.
 */
const generateToken = (res: Response, userId: string) => {
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ userId }, secret, {
        expiresIn: '30d',
    });

    // Strategy: Layered Security
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side scripts from accessing the token (XSS protection)
        secure: process.env.NODE_ENV !== 'development', // Ensures cookies are only sent over HTTPS in prod
        sameSite: 'strict', // Prevents the browser from sending cookie along with cross-site requests (CSRF protection)
        maxAge: 30 * 24 * 60 * 60 * 1000, // Session duration: 30 days
    });
};

export default generateToken;
