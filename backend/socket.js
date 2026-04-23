import { Server } from 'socket.io'; // 👈 Use import

const initSocket = (server, pool) => {
  const io = new Server(server, {
    path: "/socket.io/",
  cors: {
    origin: ["http://localhost:5173", "https://a-z-final-c6n4.vercel.app"], // Must match server.js
    methods: ["GET", "POST"],
    credentials: true
  }
});

  const startPgListener = async () => {
  try {
    const client = await pool.connect();
    
    // Explicitly handle the notification event on this specific client
    await client.query('LISTEN new_message_channel');
    
    client.on('notification', (msg) => {
      if (!msg.payload) return;
      const payload = JSON.parse(msg.payload);
      const roomName = String(payload.booking_id);
      
     
      io.to(roomName).emit('receive_message', payload);
    });

    // Handle client disconnects
    client.on('error', (err) => {
      console.error('Postgres Listener Client Error:', err);
      client.release(); // Release the broken client
      setTimeout(startPgListener, 5000); // Reconnect
    });

  } catch (err) {
    console.error("Failed to connect PG Listener:", err);
    setTimeout(startPgListener, 5000);
  }
};

  startPgListener();

io.on('connection', (socket) => {
 

  socket.on('join_booking', (bookingId) => {
    const roomName = String(bookingId);
    socket.join(roomName);
   
  });
});

  return io;
};

export default initSocket; // 👈 Use export default