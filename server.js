require('dotenv').config();
const express = require('express');
const connectDB = require('./src/utils/db');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const docsRoutes = require('./src/routes/docsRoutes');
const askRoutes = require('./src/routes/askRoutes');

const app = express();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { 
    ip: req.ip,
    userAgent: req.get('User-Agent') 
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/ask', askRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/{*path}', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last!)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
};

start();

module.exports = app; // For testing