import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js'// Note the .js extension is often required in ESM
import userRoutes from './routes/userRoutes.js';
import proRoutes from'./routes/proRoutes.js';
import bookingRoutes from'./routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
const app = express();

// Make sure you have BOTH your local and Vercel links
const allowedOrigins = [
  'http://localhost:5174',
  'https://a-z-final-c6n4.vercel.app' 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/pro',proRoutes);
app.use('/api/bookings',bookingRoutes)
app.use('/api/auth',authRoutes);
// index.js 

// This tells Express to serve everything in the 'uploads' folder as a public URL
app.use('/uploads', express.static('uploads'));

// ... other middleware (cors, express.json)

// All customer routes will start with /api/users
app.get("/ping", (req, res) => {
  res.status(200).send("Server is awake");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
