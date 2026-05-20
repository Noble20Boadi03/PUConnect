import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Load environment variables from .env file
dotenv.config();

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
