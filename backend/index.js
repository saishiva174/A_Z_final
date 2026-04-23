import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // 👈 CHANGE 1: Import HTTP server
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import proRoutes from './routes/proRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import 'dotenv/config';


import pool from './db.js'; 
import initSocket from './socket.js'; 

const app = express();
const server = createServer(app); // 👈 CHANGE 3: Wrap Express in the HTTP server

const allowedOrigins = [
  'http://localhost:5173',
  'https://a-z-final-c6n4.vercel.app' 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const ip=initSocket(server, pool);
app.use((req, res, next) => {
  req.io = ip; // 'io' is your socket.io server instance
  next();
});
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


server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});