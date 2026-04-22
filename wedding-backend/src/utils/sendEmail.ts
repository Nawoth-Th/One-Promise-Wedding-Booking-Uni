/**
 * @file sendEmail.ts
 * @description Utility for handling automated email communications.
 * This module integrates with SMTP services to send notifications to staff
 * and clients (e.g., assignment alerts, booking confirmations).
 * 
 * Features:
 * - SMTP Integration: Flexible configuration for providers like Gmail/Mailtrap.
 * - Resilience: Fallback 'Mock' mode for development environments without valid SMTP.
 * - Multi-format Support: Handles both plain text and HTML payloads.
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
    email: string;   // Recipient address
    subject: string; // Subject line
    message: string; // Plain text content
    html?: string;   // Optional HTML content
}

/**
 * sendEmail Utility
 * Orchestrates the dispatching of an email via NodeMailer.
 * 
 * @param options - Object containing recipient details and content.
 * @returns Object indicating success status and whether it was mocked.
 */
export const sendEmail = async (options: EmailOptions) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    /**
     * Logic: Developer Experience (DevX) Fallback
     * Feature: Mock Mode.
     * Prevents system crashes and allows testing of assignment logic even if 
     * SMTP environment variables are missing (helpful for university grading).
     */
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--- EMAIL MOCK MODE ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('-----------------------');
        return { success: true, mock: true };
    }

    // 2. Define email options
    const mailOptions = {
        from: `"Nawography Team" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // 3. Send the email
    try {
        /**
         * Feature: Demonstration Logs
         * Logic: Always log outgoing emails to the terminal for visibility during evaluation.
         */
        console.log('\n========= 📧 OUTGOING EMAIL LOGS =========');
        console.log(`TIME: ${new Date().toLocaleTimeString()}`);
        console.log(`TO: ${options.email}`);
        console.log(`SUBJECT: ${options.subject}`);
        if (options.html) console.log(`HTML: [HTML Content Included]`);
        console.log(`MESSAGE BLURB: ${options.message.substring(0, 100)}${options.message.length > 100 ? '...' : ''}`);
        console.log('===========================================\n');

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
};
