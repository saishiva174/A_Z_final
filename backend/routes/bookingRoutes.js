import express from "express";
import pool from "../db.js";
const router=express.Router();

router.patch('/status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // IMPORTANT: Verify these column names match your PG table exactly
    let query;
    let values;

    if (status === 'Completed') {
      // Ensure 'completed_at' exists in your table!
      query = `UPDATE bookings SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
      values = [status, id];
    } else {
      query = `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`;
      values = [status, id];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("BACKEND ERROR:", err.message); // Look at your terminal for this output!
    res.status(500).json({ error: "Database error occurred" });
  }
});

router.post('/reviews', async (req, res) => {
    const { booking_id, pro_id, rating, comment } = req.body;

    // 1. Validation
    if (!booking_id || !pro_id || !rating) {
        return res.status(400).json({ error: "Missing required fields: booking_id, pro_id, and rating are mandatory." });
    }

    const client = await pool.connect();

    try {
        // Start Transaction
        await client.query('BEGIN');

        // 2. Insert the new review
        const insertReviewSql = `
            INSERT INTO reviews (booking_id, pro_id, rating, comment, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id;
        `;
        await client.query(insertReviewSql, [booking_id, pro_id, rating, comment]);

        // 3. Update the professional's average rating in the users table
        // We calculate the average of all reviews for this pro and round to 1 decimal place
        const updateProRatingSql = `
            UPDATE users 
            SET rating = (
                SELECT ROUND(AVG(rating)::numeric, 1) 
                FROM reviews 
                WHERE pro_id = $1
            )
            WHERE id = $1;
        `;
        await client.query(updateProRatingSql, [pro_id]);

        // 4. (Optional) Mark the booking as reviewed so the user can't review it twice
        const updateBookingSql = `
            UPDATE bookings 
            SET status = 'Reviewed' 
            WHERE id = $1;
        `;
        await client.query(updateBookingSql, [booking_id]);

        // Commit Transaction
        await client.query('COMMIT');

        res.status(201).json({ message: "Review submitted and professional rating updated!" });
    } catch (error) {
        // If anything fails, rollback all changes
        await client.query('ROLLBACK');
        console.error("Error in /api/reviews:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
});

export default router;