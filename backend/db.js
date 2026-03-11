import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // This logic checks if the URL contains 'localhost' or '127.0.0.1'
  ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') 
    ? false 
    : { rejectUnauthorized: false }
});
// Connection Test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("❌ DATABASE CONNECTION ERROR:", {
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