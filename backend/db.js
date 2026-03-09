import pkg from 'pg';
import dotenv from 'dotenv'; // 1. Import dotenv
const { Pool } = pkg;

dotenv.config(); // 2. Initialize dotenv

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: process.env.DATABASE_NAME, 
  password: process.env.DATABASE_PASS,
  port: 5432,
});

// Connection Test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
   
    console.error({
      message: err.message,
      code: err.code,
      received_db: process.env.DATABASE_NAME // Check if this is still undefined
    });
  } else {
    console.log("✅ DATABASE CONNECTED");
  }
});

export default pool;