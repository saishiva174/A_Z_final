import nodemailer from 'nodemailer';
import dns from 'node:dns';


import { Resend } from 'resend';

// Initialize Resend with your API Key from Render's Env Vars
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend provides this for testing
      to: email,
      subject: 'Verify your email - A-Z Services',
       html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Email Verification</h2>
        <p>Your verification code for A-Z Services is:</p>
        <h1 style="color: #4f46e5; letter-spacing: 8px; font-size: 32px;">${otp}</h1>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw error;
  }
};

