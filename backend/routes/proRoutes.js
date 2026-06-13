import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { uploadDoc } from '../middleware/cloudinaryConfig.js'
import axios from 'axios';
const router = express.Router();

// --- 1. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/pro_docs/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const proName = req.body.name ? req.body.name.replace(/\s+/g, '_').toLowerCase() : 'pro';
    const date = new Date().toISOString().split('T')[0];
    const extension = path.extname(file.originalname);
    cb(null, `${proName}-${date}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- 2. PROFESSIONAL REGISTRATION ROUTE ---
router.post('/register', uploadDoc.single('document'), async (req, res) => {
  try {
    // Added phone_number to destructuring
    const { name, email, password, phone_number, service, location } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Proof of license/ID is required." });
    }

    // Check if user already exists by Email OR Phone
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $2", 
      [email, phone_number]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "A user with this email or phone number already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const docUrl =req.file.path;

    // Added phone_number to the INSERT query
    const newPro = await pool.query(
      `INSERT INTO users (name, email, password, phone_number, role, service, id_document_url, is_verified, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, phone_number, is_verified`,
      [name, email, hashedPassword, phone_number, 'pro', service, docUrl, false, location]
    );

    res.status(201).json({
      message: "Professional registered successfully! Awaiting Admin approval.",
      user: newPro.rows[0]
    });

  } catch (err) {
    console.error("Pro Registration Error:", err.message);
    res.status(500).json({ message: "Server error during registration." });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 1. Find user by Email or Phone (Don't filter role in SQL yet)
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone_number = $1", 
      [identifier]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    // 2. SPECIFIC ROLE CHECKS
    if (user.role === 'customer') {
      return res.status(403).json({ 
        message: "Please use the Customer login page." 
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ 
        message: "Admins must use the Management Console." 
      });
    }

    // Ensure they are a 'pro' before proceeding
    if (user.role !== 'pro') {
      return res.status(403).json({ message: "Access denied for this account type." });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. Verification Check (Pro-specific feature)
    if (!user.is_verified) {
      return res.status(403).json({ message: "Account pending approval. Please check back later." });
    }
   
    // 5. Success
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name // Good to include for the dashboard greeting
      }
    });
      
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});
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


// --- 4. ADMIN ROUTES (Keep as is, but include phone in selection) ---
router.get('/pending', async (req, res) => {
  try {
    const pendingPros = await pool.query(
      "SELECT id, name, email, phone_number, service, location, id_document_url, created_at FROM users WHERE role = 'pro' AND is_verified = false ORDER BY created_at DESC"
    );
    res.json(pendingPros.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put('/verify/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    const updatedPro = await pool.query(
      "UPDATE users SET is_verified = $1 WHERE id = $2 RETURNING id, name, is_verified",
      [status, id]
    );

    if (updatedPro.rows.length === 0) {
      return res.status(404).json({ message: "Professional not found." });
    }

    res.json({
      message: status ? "Professional Approved" : "Professional Status Reset",
      user: updatedPro.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/pro/available
// @desc    Get all verified professionals for the customer dashboard
router.get('/available',verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone_number, 
        u.service, 
        u.location, 
        u.rate, 
        u.profile_pic_url,
        u.rating, -- Pulling directly from users table
        COUNT(r.id)::INTEGER as "review_count" -- Counting reviews from reviews table
      FROM users u
      LEFT JOIN reviews r ON u.id = r.pro_id
      WHERE u.role = 'pro' AND u.is_verified = true 
      GROUP BY u.id
      ORDER BY u.rating DESC, u.name ASC;
    `;

    const result = await pool.query(query);

    // Format results for the frontend
    const professionals = result.rows.map(pro => ({
      ...pro,
      // Ensure rating is a float for star displays (e.g., 4.5)
      rating: pro.rating ? parseFloat(pro.rating).toFixed(1) : "0.0",
      review_count: pro.review_count || 0
    }));

    res.json(professionals);
  } catch (err) {
    console.error("Fetch Pros Error:", err.message);
    res.status(500).json({ message: "Server error fetching professionals" });
  }
});



router.get('/profile/:id', async (req, res) => {
  try {

   
   const Id = req.params.id; 

    const proId = parseInt(Id);

    // 1. Fetch Professional Profile
    const userResult = await pool.query(
      "SELECT id, name, email, phone_number, role, location, rate, bio, profile_pic_url, rating FROM users WHERE id = $1",
      [proId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch Reviews + Total Count using Window Function
    const reviewsResult = await pool.query(
      `SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        u.name as customer_name,
        COUNT(*) OVER() as total_reviews
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON b.customer_id = u.id
       WHERE r.pro_id = $1
       ORDER BY r.id DESC`,
      [proId]
    );

    // Extract total count from the first row if reviews exist, otherwise 0
    const reviewCount = reviewsResult.rows.length > 0 
      ? parseInt(reviewsResult.rows[0].total_reviews) 
      : 0;

  

    res.json({
      ...userResult.rows[0],
      review_count: reviewCount,
      reviews: reviewsResult.rows
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/all-jobs',verifyToken, async (req, res) => {
    const proId = req.user.id;
      
    try {
       const sql = `
    SELECT 
        b.id, 
        b.service_type, 
        b.budget, 
        b.location, 
        b.preferred_time, 
        b.description,
        b.status,
        b.completed_at,               -- Added to track when job ended
        u.id AS customer_id,
        u.name AS customer_name,
        u.phone_number AS customer_phone,
        u.profile_pic_url AS customer_avatar,
        -- Get job images
        COALESCE(
            (SELECT json_agg(bi.image_url) 
             FROM booking_images bi 
             WHERE bi.booking_id = b.id), 
        '[]') AS job_images,
        -- Join review data
        r.rating AS user_rating,       -- Star rating
        r.comment AS user_comment     -- Review text
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    -- LEFT JOIN is used so bookings without reviews aren't excluded
    LEFT JOIN reviews r ON r.booking_id = b.id 
    WHERE b.pro_id = $1
    ORDER BY b.created_at DESC;
`;
        const result = await pool.query(sql, [proId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching all pro jobs:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/overview',verifyToken, async (req, res) => {
    const  providerId = req.user.id;

    try {
        // 1. Get Aggregated Stats
        // We use double quotes for "reviews" and "rating" to be safe with Postgres
        const statsQuery = `
            SELECT 
                COALESCE(SUM(b.budget::INTEGER), 0) as "totalEarnings",
                COUNT(DISTINCT b.id) as "totalJobs",
                COALESCE(AVG(r.rating), 0) as "avgRating"
            FROM bookings b
            LEFT JOIN reviews r ON b.id = r.booking_id
            WHERE b.pro_id = $1 AND b.status IN ('Completed', 'Reviewed')
        `;

        // 2. Get Recent History
        const historyQuery = `
            SELECT 
                b.id, 
                b.service_type as service, 
                u.name as customer, 
                b.completed_at as date, 
                b.budget as amount, 
                b.status 
            FROM bookings b
            JOIN users u ON b.pro_id = u.id
            WHERE b.pro_id = $1 AND b.status IN ('Completed', 'Reviewed')
            ORDER BY b.id DESC
            LIMIT 5
        `;

        const [statsRes, historyRes] = await Promise.all([
            pool.query(statsQuery, [providerId]),
            pool.query(historyQuery, [providerId])
        ]);

        const stats = statsRes.rows[0];

        res.json({
            profile: {
                total_earnings: parseInt(stats.totalEarnings) || 0,
                completed_jobs: parseInt(stats.totalJobs) || 0,
                rating: parseFloat(stats.avgRating || 0).toFixed(1)
            },
            history: historyRes.rows.map(item => ({
                id: item.id,
                service: item.service,
                customer: item.customer,
                date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'Recent',
                amount: item.amount,
                status: item.status
            }))
        });

    } catch (error) {
        console.error("Postgres Dashboard Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
export default router;





router.post('/update-location', verifyToken, async (req, res) => {
    const { provider_id, latitude, longitude } = req.body;

    // 1. Basic validation check
    if (!provider_id || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
            error: "Missing required tracking vectors: provider_id, latitude, or longitude." 
        });
    }

    try {
        // 2. Perform an UPSERT operation on your separate AI metrics table
        // This inserts a new row if it's their first sync, or updates their coordinates if they already exist.
        const queryText = `
            INSERT INTO provider_ai_metrics (provider_id, live_latitude, live_longitude, last_login_sync)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (provider_id) 
            DO UPDATE SET 
                live_latitude = EXCLUDED.live_latitude,
                live_longitude = EXCLUDED.live_longitude,
                last_login_sync = CURRENT_TIMESTAMP;
        `;

        await pool.query(queryText, [provider_id, latitude, longitude]);

        // 3. Respond with a clean HTTP 200 OK status
        return res.status(200).json({ 
            success: true, 
            message: "Telemetry metrics synced to Neon cluster cleanly." 
        });

    } catch (error) {
        console.error("Database tracking sync exception:", error);
        return res.status(500).json({ 
            error: "Internal server error updating telemetry layer." 
        });
    }
});





function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999.0; // Return a large fallback distance if data is missing

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2)); // Distance rounded to 2 decimal places
}

// @route   POST /api/pro/available-ai
// @desc    Get filtered professionals ranked by an asynchronous XGBoost ML pipeline
// @access  Private (Requires JWT token)
router.post('/available-ai', verifyToken, async (req, res) => {
    const { service_type, customer_lat, customer_lon } = req.body;

    // 1. Validation check
    if (!service_type) {
        return res.status(400).json({ error: "Service category selection is required." });
    }
     console.log(service_type)
    try {
        // 2. Fetch candidates matching the service from Neon using a relational JOIN
        const SQLQuery = `
           SELECT 
    u.id, u.name, u.service, u.rate, u.rating, u.total_reviews, u.is_verified, u.profile_pic_url, u.location,
    -- If missing, these fallback gracefully to NULL
    aim.live_latitude, 
    aim.live_longitude
FROM users u
LEFT JOIN provider_ai_metrics aim ON u.id = aim.provider_id
WHERE u.role = 'pro' 
  AND u.service = $1 
  -- We wrap this in an OR check so we don't accidentally filter out the NULL rows!
  AND (aim.is_available = true OR aim.is_available IS NULL);`

        const dbResult = await pool.query(SQLQuery, [service_type]);
        const professionals = dbResult.rows;
         console.log(professionals)
        if (professionals.length === 0) {
            return res.status(200).json([]); // Return clean empty array if no pros are found
        }

        // 3. Complete Feature Engineering: Compute Haversine distance for each candidate
        const candidatesWithDistance = professionals.map(pro => {
            let distance = 20.0; // Default logical fallback distance if customer GPS is unavailable

            if (customer_lat && customer_lon) {
                distance = calculateHaversineDistance(
                    Number(customer_lat), 
                    Number(customer_lon), 
                    Number(pro.live_latitude), 
                    Number(pro.live_longitude)
                );
            }

            return {
                id: pro.id,
                name: pro.name,
                service: pro.service,
                rate: parseFloat(pro.rate || 0),
                rating: parseFloat(pro.rating || 5.0),
                total_reviews: parseInt(pro.total_reviews || 0),
                is_verified: pro.is_verified ? 1 : 0, // Convert boolean to binary 0/1 flag for XGBoost
                profile_pic_url: pro.profile_pic_url,
                location: pro.location,
                distance: distance // Newly generated feature required by the ML model matrix
            };
        });

        // 4. Forward the dataset payload to your Python FastAPI inference engine
        // Assuming your Python microservice runs locally on port 8000
        try {
          const aiBaseUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
          console.log(aiBaseUrl)
            const pythonAiResponse = await axios.post(`${aiBaseUrl}/rank-professionals`, {
                professionals: candidatesWithDistance
            });

            // The Python server returns the array already sorted with match_score and ai_reason tags!
            return res.status(200).json(pythonAiResponse.data);

        } catch (aiError) {
            console.error("FastAPI Machine Learning pipeline communication failure:", aiError.message);
            
            // Fail-safe Graceful Degradation: Fallback to basic database sorting if the AI server is offline
            const fallbackSorted = candidatesWithDistance.sort((a, b) => b.rating - a.rating);
            
            // Append temporary baseline notifications so the UI doesn't break
            const finalizedFallback = fallbackSorted.map(pro => ({
                ...pro,
                match_score: 100,
                ai_reason: "Ranked by historical rating (AI engine currently updating)"
            }));

            return res.status(200).json(finalizedFallback);
        }

    } catch (error) {
        console.error("Error processing AI Smart Match route:", error);
        return res.status(500).json({ error: "Internal server error assembling match vectors." });
    }
});