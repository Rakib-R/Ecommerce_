
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { TransportOptions } from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,                   // Switch from 465 to 587
    secure: false,               // Must be false for port 587
    // service: process.env.SMTP_SERVICE, //! REMOVE FOR DEVELOPMENT SPEED
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    family: 4,
    tls: {
      rejectUnauthorized: false   ////! ADDED FOR DEVELOPMENT ONLY
    }
  }  as TransportOptions);

// Render an EJS email template   ////!@@🐱‍🚀🐱‍🚀🐱‍🚀🐱‍🚀@ MODIFIED BY CLAUDE CODE  🐱‍🚀🐱‍🚀🐱‍👓🐱‍🐉//// 
    const EMAIL_TEMPLATES: Record<string, string> = {
  "forgot-password-buyer-mail": `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin:0; padding:0; background-color:#f4f6f8; font-family:Arial,sans-serif; }
        .email-wrapper { width:100%; background-color:#f4f6f8; padding:40px 0; }
        .email-container { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); }
        .email-header { background:linear-gradient(135deg,#000,#222); padding:30px; text-align:center; color:#fff; }
        .email-header h1 { margin:0; font-size:22px; }
        .email-body { padding:30px; color:#333; font-size:15px; line-height:1.6; }
        .otp-code { display:inline-block; padding:15px 30px; font-size:28px; letter-spacing:6px; font-weight:bold; background:#f1f3f5; border-radius:10px; border:2px dashed #d1d5db; }
        .email-footer { text-align:center; font-size:13px; color:#888; padding:20px 30px; }
        .highlight { font-weight:bold; color:#000; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header"><h1>Password Reset Request – Eshop</h1></div>
          <div class="email-body">
            <p>Hello <span class="highlight"><%= name %></span>,</p>
            <p>We received a request to reset your password for your Eshop account.</p>
            <p>Use the OTP below to reset your password:</p>
            <div style="margin:25px 0;text-align:center;">
              <div class="otp-code"><%= otp %></div>
            </div>
            <p>This OTP is valid for the next <span class="highlight">5 minutes</span>.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="email-footer">© <%= new Date().getFullYear() %> Eshop. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `,
  // Add other templates here as needed
};

  const renderEmailTemplate = async (
    templateName: string,
    data: Record<string, any>
  ): Promise<string> => {
    const template = EMAIL_TEMPLATES[templateName];
    if (!template) throw new Error(`Template "${templateName}" not found`);
    return ejs.render(template, data); // ejs.render() works on strings, no file needed
  };



// Send an email using nodemailer
    export const sendEmail = async (
      to: string, subject: string, templateName: string, data: Record<string, any>
    ) => {

    try {
      if (!to) throw new Error("Recipient email (to) is undefined");  // ADD THIS
      
      const html = await renderEmailTemplate(templateName, data);
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
        return false;
      }
    };