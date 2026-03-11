import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

// This version is MUCH better for deployment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use the full string from Neon
  ssl: {
    rejectUnauthorized: false // This is REQUIRED for Neon/Render to talk securely
  }
});

// Connection Test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ DATABASE CONNECTION ERROR: debugging", {
      message: err.message,
      code: err.code,
      // Helps you debug if the environment variable is missing
      has_url: !!process.env.DATABASE_URL 
    });
  } else {
    console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
  }
});

export default pool;