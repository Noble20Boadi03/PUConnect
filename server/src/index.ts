import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import exploreRoutes from './routes/exploreRoutes';
import postRoutes from './routes/postRoutes';
import profileRoutes from './routes/profileRoutes';
import providerServiceRoutes from './routes/providerServiceRoutes';
import serviceRequestRoutes from './routes/serviceRequestRoutes';
import chatRoutes from './routes/chatRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Load environment variables from .env file
// dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Set up Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store user ID to socket ID mappings
const userSocketMap = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with their user ID
  socket.on('join', (userId: string) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from map
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// Export io and userSocketMap so controllers can use them
export { io, userSocketMap };

// Enable CORS (Cross-Origin Resource Sharing)
// This is critical to allow mobile devices/emulators to connect to the backend
app.use(cors({
  origin: '*', // Allow all origins for development; narrow this down in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Express built-in middleware to parse incoming JSON payloads
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/provider-services', providerServiceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'PUConnect API Server is running successfully.',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Start Server (using server instead of app.listen)
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
