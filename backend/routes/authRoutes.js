import express from 'express';
import pool from '../db.js'; // Assuming your pool is exported from db.js
import { sendOTPEmail } from './mailer.js';

const router = express.Router();

// PHASE 1: Send OTP to the email entered
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Insert or Update the OTP for this email
  // In your /send-otp route
await pool.query(
  `INSERT INTO temp_verifications (email, otp, created_at) 
   VALUES ($1, $2, NOW()) 
   ON CONFLICT (email) DO UPDATE SET otp = $2, created_at = NOW(), is_verified = FALSE`,
  [email, otp]
);

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database or Mailer error" });
  }
});

// PHASE 2: Check if the OTP matches
router.post('/verify-otp-only', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // We check: 
    // 1. Email matches
    // 2. OTP matches
    // 3. Current time is NOT more than 10 minutes after created_at
    const result = await pool.query(
      `SELECT * FROM temp_verifications 
       WHERE email = $1 
       AND otp = $2 
       AND created_at > NOW() - INTERVAL '10 minutes'`,
      [email, otp]
    );

    if (result.rows.length > 0) {
      // Mark as verified in the temp table
      await pool.query(
        'UPDATE temp_verifications SET is_verified = TRUE WHERE email = $1', 
        [email]
      );
      res.status(200).json({ success: true, message: "Email verified" });
    } else {
      // If the query returns 0 rows, it's either the wrong OTP 
      // OR the OTP exists but it's older than 10 minutes.
      res.status(400).json({ message: "Invalid or expired code" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;