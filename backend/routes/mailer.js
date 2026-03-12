import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for port 587
  requireTLS: true, // Forces the connection to upgrade to secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // This is the key to stopping the ENETUNREACH error
  tls: {
    servername: 'smtp.gmail.com',
    // Prevents the mailer from trying IPv6 addresses
    minVersion: 'TLSv1.2'
  }
});

// Final check: Some environments still need the family forced
transporter.options.family = 4;
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