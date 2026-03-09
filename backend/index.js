import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js'// Note the .js extension is often required in ESM
import userRoutes from './routes/userRoutes.js';
import proRoutes from'./routes/proRoutes.js';
import bookingRoutes from'./routes/bookingRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/pro',proRoutes);
app.use('/api/bookings',bookingRoutes)
// index.js 

// This tells Express to serve everything in the 'uploads' folder as a public URL
app.use('/uploads', express.static('uploads'));

// ... other middleware (cors, express.json)

// All customer routes will start with /api/users

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
