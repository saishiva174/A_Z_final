import { Server } from 'socket.io';

const initSocket = (server) => {
  const io = new Server(server, {
    path: "/socket.io/",
    cors: {
      // Added your specific Vercel and local origins
      origin: ["http://localhost:5173", "https://a-z-final-c6n4.vercel.app"], 
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Room joining logic
    socket.on('join_booking', (bookingId) => {
      const roomName = String(bookingId);
      socket.join(roomName);
      console.log(`User ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initSocket;