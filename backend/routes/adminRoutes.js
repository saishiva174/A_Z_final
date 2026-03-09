import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js'; // Ensure your db.js uses 'export default' as well
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { uploadProfile ,deleteFromCloudinary} from '../middleware/cloudinaryConfig.js';
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profile_pics/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    
    const userId = req.body.id;
    cb(null, `user_${userId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });


const verifyToken = (req, res, next) => {

    const authHeader = req.header("Authorization");
    
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Authorization header missing or invalid format");
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


router.put('/update-full-profile',verifyToken, uploadProfile.single('profilePic'), async (req, res) => {
  const id=req.user.id
  const { name, phone_number, location ,bio, rate} = req.body;
  
  try {
    
    const profilePicUrl = req.file ? req.file.path : null;

    const userResult = await pool.query(
            "SELECT profile_pic_url FROM users WHERE id = $1", 
            [id]
        );
        const oldImageUrl = userResult.rows[0]?.profile_pic_url;

        // 3. Delete the OLD image from Cloudinary if it exists
        if (oldImageUrl) {
            await deleteFromCloudinary(oldImageUrl);
        }
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, 
           phone_number = $2, 
           location = $3,
           bio=$4,
           rate=$5, 
           profile_pic_url = COALESCE($6, profile_pic_url) 
       WHERE id = $7 
       RETURNING id, name, email, phone_number, location, profile_pic_url, role`,
      [name, phone_number, location,bio,rate, profilePicUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

   
    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: result.rows[0] 
    });

  } catch (err) {
    console.error("Update Route Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;


    
    // SAFETY CHECK: If password is missing, stop here
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: "Password is required and must be a string." });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Now password is guaranteed to be a string

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, hashedPassword, 'admin', true]
    );

    res.json({ message: "Admin created!", id: newUser.rows[0].id });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    // 2. GENERATE TOKEN (The "Key" to the house)
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, // In production, put this in .env
      { expiresIn: "1h" }
    );

    // 3. Send the token to React
    res.json({
      message: "Login successful",
      token, // <-- Add this!
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});


// 1. Get all professionals waiting for approval
router.get('/pending-pros', async (req, res) => {
  try {
    const pros = await pool.query("SELECT * FROM users WHERE role = 'pro' AND is_verified = false");
    res.json(pros.rows);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


router.put('/verify/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status will be 'approve' or 'reject'

  try {
    if (status === 'approve') {
      await pool.query(
        "UPDATE users SET is_verified = true WHERE id = $1", 
        [id]
      );
      return res.json({ msg: "Professional Approved Successfully" });
    } 
    
    if (status === 'reject') {
     
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
     
      return res.json({ msg: "Professional Application Rejected" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route   GET /api/admin/verified-pros
// @desc    Get all professionals who have been approved by admin
router.get('/verified-pros', async (req, res) => {
  try {
    const verifiedPros = await pool.query(
      "SELECT id, name, email, service, location, profile_pic_url, created_at FROM users WHERE role = 'pro' AND is_verified = true ORDER BY name ASC"
    );
    
    // Return the array of rows
    res.json(verifiedPros.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error fetching approved pros" });
  }
});

// @route   GET /api/admin/all-customers
// @desc    Get all registered customers (non-professionals)
router.get('/all-customers', async (req, res) => {
  try {
    const customers = await pool.query(
      "SELECT id, name, email, location, profile_pic_url, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
    );
    
    res.json(customers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.get('/earnings-summary', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(id)::INTEGER as "completed_bookings_count",
        COALESCE(SUM(budget), 0)::FLOAT as "total_revenue"
       FROM bookings 
       WHERE status IN ('Completed', 'Reviewed')`
    );
    
    // This will log: { completed_bookings_count: 5, total_revenue: 15000.50 }
    
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Admin Stats Error:", err.message);
    res.status(500).json({ message: "Error fetching admin summary" });
  }
});

router.get('/pro-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proId = parseInt(id);

    // 1. Get ONLY the user bio first
    const userResult = await pool.query(
      "SELECT id, name, email, phone_number, location, profile_pic_url FROM users WHERE id = $1",
      [proId]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ message: "Pro not found" });

    // 2. Get Earnings & Count (Strictly from Bookings table only)
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*)::INTEGER as completed_count,
        COALESCE(SUM(budget), 0)::FLOAT as total_earnings
       FROM bookings 
       WHERE pro_id = $1 AND status IN ('Completed', 'Reviewed')`,
      [proId]
    );

    // 3. Get Average Rating (Strictly from Reviews table only)
    const ratingResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0)::FLOAT as average_rating 
       FROM reviews 
       WHERE pro_id = $1`,
      [proId]
    );

    // 4. Get Booking History
  const bookingsResult = await pool.query(
  `SELECT 
    b.id, 
    b.service_type, 
    b.status, 
    b.budget, 
    b.created_at,
    b.completed_at,
    b.description,
    b.location,
    u.id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone_number AS customer_phone,
    u.profile_pic_url AS customer_avatar,
    r.rating AS booking_rating,
    r.comment AS booking_review,
    COALESCE(
      (SELECT ARRAY_AGG(image_url) 
       FROM booking_images 
       WHERE booking_id = b.id), 
      '{}'
    ) AS job_images
   FROM bookings b
   INNER JOIN users u ON b.customer_id = u.id
   LEFT JOIN reviews r ON b.id = r.booking_id
   WHERE b.pro_id = $1
   ORDER BY b.created_at DESC`,
  [proId]
); 

    // Combine everything into one response
    res.json({
      summary: {
        ...userResult.rows[0],
        total_earnings: statsResult.rows[0].total_earnings,
        completed_count: statsResult.rows[0].completed_count,
        average_rating: ratingResult.rows[0].average_rating
      },
      bookings: bookingsResult.rows
    });

  } catch (err) {
    console.error("Critical Query Error:", err.message);
    res.status(500).send("Server Error");
  }
});

router.get('/customer-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const custId = parseInt(id);

    // 1. Basic Customer Bio
    const userResult = await pool.query(
      "SELECT id, name, email, phone_number, location, profile_pic_url, created_at FROM users WHERE id = $1",
      [custId]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ message: "Customer not found" });

    // 2. Spending Stats (Only counting Completed/Reviewed jobs)
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*)::INTEGER as total_bookings_count,
        COALESCE(SUM(budget), 0)::FLOAT as total_spent
       FROM bookings 
       WHERE customer_id = $1 AND status IN ('Completed', 'Reviewed')`,
      [custId]
    );

    // 3. Booking History with Professional Names and Images
    const bookingsResult = await pool.query(
      `SELECT 
        b.id, b.service_type, b.status, b.budget, b.created_at, b.description,
        u.name as pro_name,
        (SELECT ARRAY_AGG(image_url) FROM booking_images WHERE booking_id = b.id) as job_images
       FROM bookings b
       LEFT JOIN users u ON b.pro_id = u.id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC`,
      [custId]
    );

    res.json({
      summary: {
        ...userResult.rows[0],
        total_spent: statsResult.rows[0].total_spent,
        total_bookings_count: statsResult.rows[0].total_bookings_count
      },
      bookings: bookingsResult.rows
    });

  } catch (err) {
    console.error("Error in customer-details:", err.message);
    res.status(500).send("Server Error");
  }
});
export default router;