import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // 👈 This is the correct import
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import proRoutes from './routes/proRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import 'dotenv/config';

import pool from './db.js'; 
import initSocket from './socket.js'; 

const app = express();

// ✅ FIX: Use 'createServer(app)' directly since you imported it that way
const server = createServer(app); 

// ✅ Initialize socket and attach it to the app
const io = initSocket(server);
app.set('socketio', io); 

const allowedOrigins = [
  'http://localhost:5173',
  'https://a-z-final-c6n4.vercel.app' 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/pro', proRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/ping", (req, res) => {
  res.status(200).send("Server is awake");
});

const PORT = process.env.PORT || 5000;

// ✅ Using '0.0.0.0' is great for Render deployment
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});