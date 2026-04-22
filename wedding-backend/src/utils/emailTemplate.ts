/**
 * @file emailTemplate.ts
 * @description Master Branding Template for Automated Communications.
 * This utility wraps plain text messages into high-fidelity, branded HTML emails
 * consistent with the One Promise Wedding identity.
 */

interface TemplateOptions {
    title: string;
    preheader?: string;
    content: string; // HTML allowed
    ctaText?: string;
    ctaUrl?: string;
}

/**
 * generateEmailHtml
 * Wraps content in a responsive, premium HTML shell.
 */
export const generateEmailHtml = ({
    title,
    preheader = "Important update from One Promise Wedding",
    content,
    ctaText,
    ctaUrl
}: TemplateOptions): string => {
    // Branding Tokens
    const primaryColor = '#467889';
    const secondaryColor = '#1a1a1a';
    const backgroundColor = '#f8f9fa';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${backgroundColor}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: ${secondaryColor}; padding: 40px 20px; text-align: center; }
        .logo-text { color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
        .logo-subtext { color: ${primaryColor}; font-size: 10px; letter-spacing: 2px; margin-top: 5px; text-transform: uppercase; }
        .content { padding: 40px; line-height: 1.6; color: #333333; font-size: 16px; }
        .content h1 { color: ${secondaryColor}; font-size: 22px; margin-bottom: 20px; font-weight: 700; }
        .content p { margin-bottom: 20px; }
        .button-container { text-align: center; margin-top: 30px; margin-bottom: 10px; }
        .button { background-color: ${primaryColor}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; transition: background-color 0.3s ease; }
        .footer { background-color: #f1f1f1; padding: 30px 20px; text-align: center; color: #777777; font-size: 12px; }
        .footer p { margin: 5px 0; }
        .social-links { margin-top: 15px; }
        .social-links a { margin: 0 10px; color: ${primaryColor}; text-decoration: none; font-weight: bold; }
        @media only screen and (max-width: 600px) {
            .container { margin-top: 0; border-radius: 0; }
            .content { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
    <div class="container">
        <div class="header">
            <div class="logo-text">ONE PROMISE</div>
            <div class="logo-subtext">WEDDING PHOTOGRAPHY</div>
        </div>
        <div class="content">
            <h1>${title}</h1>
            ${content}
            ${ctaText && ctaUrl ? `
            <div class="button-container">
                <a href="${ctaUrl}" class="button">${ctaText}</a>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p><strong>One Promise Wedding (Pvt) Ltd.</strong></p>
            <p>Professional Wedding Photography & Videography</p>
            <p>Contact: +94 77 123 4567 | info@onepromise.lk</p>
            <div class="social-links">
                <a href="#">Instagram</a>
                <a href="#">Facebook</a>
                <a href="#">YouTube</a>
            </div>
            <p style="margin-top: 20px; font-size: 10px; opacity: 0.6;">&copy; 2026 One Promise Wedding. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};
