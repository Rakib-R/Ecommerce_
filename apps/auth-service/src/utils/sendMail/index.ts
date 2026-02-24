import dotenv from "dotenv";
import nodemailer from "nodemailer";
import ejs from "ejs";
import { TransportOptions } from 'nodemailer';

import EMAIL_TEMPLATES from "../email-templates/index";
// IMPORT YOUR TEMPLATES HERE
// Adjust path to point to your sibling folder

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
} as TransportOptions);

// Use the templates you required above
const renderEmailTemplate = async (
    templateName: string,
    data: Record<string, any>
): Promise<string> => {
    const templateString = EMAIL_TEMPLATES[templateName];
    
    if (!templateString) {
        throw new Error(`Template "${templateName}" not found in templates.cjs.
          Available: ${Object.keys(EMAIL_TEMPLATES).join(', ')}`);
    }

    // ejs.render takes the string from your .cjs and injects the data
    return ejs.render(templateString, data);
};

export const sendEmail = async (
    email: string, 
    subject: string, 
    templateName: string, 
    data: any
) => {
    const html = await renderEmailTemplate(templateName, data);
    
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html,
    };

    return await transporter.sendMail(mailOptions);
};