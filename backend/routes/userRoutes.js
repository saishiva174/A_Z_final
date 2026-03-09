import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { uploadWork } from '../middleware/cloudinaryConfig.js';
const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    // 1. Destructure phone_number from body
    const { name, email, password, phone_number } = req.body;

    // 2. Validation (Include phone_number)
    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({ message: "Please fill all fields, including phone number" });
    }

    // 3. Check if user already exists (Check both Email and Phone)
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $2", 
      [email, phone_number]
    );

    if (userExist.rows.length > 0) {
      const existing = userExist.rows[0];
      const conflict = existing.email === email ? "email" : "phone number";
      return res.status(400).json({ message: `User already exists with this ${conflict}` });
    }

    // 4. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Insert into Database (Include phone_number)
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, phone_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone_number, role",
      [name, email, hashedPassword, phone_number, 'customer']
    );

    res.status(201).json({
      message: "Customer registered successfully",
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // 'identifier' can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide credentials" });
    }

    // 1. Find the user by Email OR Phone Number
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $1", 
      [identifier]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2. Role Check
    if (user.role !== 'customer') {
      return res.status(403).json({ message: "Please use the Admin portal" });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Success response
     const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, // In production, put this in .env
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role:user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
});


const verifyToken = (req, res, next) => {

    const authHeader = req.header("Authorization");
    
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 3. Extract the actual token string
    const token = authHeader.split(" ")[1];

    try {
        // 4. Verify using the secret from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // This contains the user id and role
        next(); // CRITICAL: This moves the request to your /profile route
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(400).json({ message: "Token is not valid" });
    }
};

router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      "SELECT id, name, email, phone_number, role, location, profile_pic_url,created_at FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Fetch User Error:", err.message);
    res.status(500).json({ message: "Server error while fetching user profile" });
  }
});





router.post('/book-job', uploadWork.array('problem_images', 10), async (req, res) => {
    const { customer_id, pro_id, service_type, description, location, preferred_time, budget } = req.body;
    
    // req.files will contain the paths of the uploaded images
    const imagePaths = req.files.map(file => file.path);

    try {
        // 1. Insert into bookings table
        const bookingResult = await pool.query(
            "INSERT INTO bookings (customer_id, pro_id, service_type, description, location, preferred_time, budget, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING id",
            [customer_id, pro_id, service_type, description, location, preferred_time, budget]
        );

        const bookingId = bookingResult.rows[0].id;

        // 2. Insert image paths into a separate table (e.g., job_images) linked to the bookingId
        for (let path of imagePaths) {
            await pool.query("INSERT INTO booking_images (booking_id, image_url) VALUES ($1, $2)", [bookingId, path]);
        }

        res.json({ message: "Booking success!" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.put('/update-price/:id', async (req, res) => {
  const { id } = req.params;
  const { cost } = req.body;

  try {
    await pool.query(
      "UPDATE bookings SET budget = $1 WHERE id = $2",
      [cost, id]
    );
    res.json({ message: "Price updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 

router.get('/bookings',verifyToken, async (req, res) => {
  const customerId = req.user.id;

  try {
  const query = `
    SELECT 
        b.id, 
        b.service_type, 
        b.budget, 
        b.location, 
        b.preferred_time, 
        b.description,
        b.status,
        b.completed_at,
        -- Now getting Professional's info instead of Customer's
        u.id AS pro_id,
        u.name AS pro_name,
        u.phone_number AS pro_phone,
        u.profile_pic_url AS pro_avatar,
        -- Subquery for Job Images
        COALESCE(
            (SELECT json_agg(bi.image_url) 
             FROM booking_images bi 
             WHERE bi.booking_id = b.id), 
        '[]') AS job_images,
        -- Review data
        r.rating AS user_rating,
        r.comment AS user_comment
    FROM bookings b
    -- We join users on pro_id so the Customer sees the Professional's details
    LEFT JOIN users u ON b.pro_id = u.id
    LEFT JOIN reviews r ON r.booking_id = b.id 
    WHERE b.customer_id = $1
    ORDER BY b.created_at DESC;
`;
    const result = await pool.query(query, [customerId]);

    // Return the full array (even if empty)
    res.json(result.rows); 
    
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
export default router;