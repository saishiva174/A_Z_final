import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  // FORCE IPv4: This fixes the ENETUNREACH 2607:... error
  // family: 4 tells the mailer to ignore IPv6 addresses
  family: 4, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
  // Optional: Increases timeout for Render's slow cold starts
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
});
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    // It's best if the 'from' email matches the 'user' in auth
    from: `"A-Z Services" <${process.env.EMAIL_USER}>`, 
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  
    return info;
  } catch (error) {
    console.error("Nodemailer Error: ", error);
    throw error; // Throwing the error helps the controller catch it
  }
};