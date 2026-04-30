const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose'); // used for Mongo readiness state
require('dotenv').config();

const connectDB = require('./config/db');
const { connectRedis, closeRedis, isRedisReady } = require('./config/redis'); // added isRedisReady
const { sendError } = require('./utils/apiResponse');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

const { connectRedis, closeRedis, isRedisReady } = require('./config/redis');
const { sendError } = require('./utils/apiResponse');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

const storeRoutes = require('./routes/storeRoutes');
const petRoutes = require('./routes/petRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');


const app = express();

// Base middleware stack for API app
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'GrowFriend API running' });
});

// API health route (kept under /api/*)
app.get('/api/health', (_req, res) => {
  // mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const mongoReady = mongoose.connection.readyState === 1;
  const redisReady = isRedisReady();

  // Mongo is required for API readiness; Redis is currently optional
  const statusCode = mongoReady ? 200 : 503;

  return res.status(statusCode).json({
    success: mongoReady,
    message: mongoReady ? 'Service healthy' : 'Service degraded',
    data: {
      mongo: {
        ready: mongoReady,
        state: mongoose.connection.readyState
      },
      redis: {
        ready: redisReady
      },
      uptimeSec: Math.floor(process.uptime())
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/store', storeRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/inventory', inventoryRoutes);

// Generic 404 for unknown endpoints
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  return sendError(res, 'Internal server error', 500);
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown helper to close Redis cleanly
async function shutdown(signal) {
  try {
    console.log(`${signal} received. Shutting down...`);
    await closeRedis();
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err.message);
    process.exit(1);
  }
}

// Handle common termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

(async () => {
  try {
    await connectDB();

    // Redis is optional: do not hard-fail app startup if Redis is unavailable
    try {
      await connectRedis();
    } catch (redisErr) {
      console.warn('Redis startup skipped:', redisErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server boot failed:', err.message);
    process.exit(1);
  }
})();
