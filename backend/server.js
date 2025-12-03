
// FILE: server.js
// Server entry point
// ============================================================================

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const { connectDatabase } = require('./src/config/database');
const { initializeBlockchain } = require('./src/config/blockchain');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
app.use(morgan('combined', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.get(`/api/${config.apiVersion}`, (req, res) => {
  res.json({
    message: 'Supply Chain Verification API',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
  });
});

// Import routes (uncomment as you create them)
// app.use(`/api/${config.apiVersion}/auth`, require('./src/routes/auth.routes'));
// app.use(`/api/${config.apiVersion}/products`, require('./src/routes/product.routes'));
// app.use(`/api/${config.apiVersion}/shipments`, require('./src/routes/shipment.routes'));
// app.use(`/api/${config.apiVersion}/blockchain`, require('./src/routes/blockchain.routes'));
// app.use(`/api/${config.apiVersion}/verify`, require('./src/routes/verification.routes'));
// app.use(`/api/${config.apiVersion}/analytics`, require('./src/routes/analytics.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');
    
    // Initialize blockchain
    await initializeBlockchain();
    logger.info('Blockchain connected successfully');
    
    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${PORT}/api/${config.apiVersion}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
