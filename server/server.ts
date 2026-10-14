import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.routes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow frontend during local development
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[Quantix Promotion Agent Server] running on http://localhost:${PORT}`);
  console.log(`[Architecture] Modular Gmail and WhatsApp Cloud integrations ready.`);
});
