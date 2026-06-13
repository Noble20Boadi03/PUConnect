import 'dotenv/config';
import express from 'express';
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
const PORT = process.env.PORT || 5000;

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

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
