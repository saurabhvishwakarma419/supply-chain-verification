// ============================================================================
// FILE: src/config/database.js
// Database configuration for MongoDB and PostgreSQL
// ============================================================================

const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * MongoDB Connection
 */
const connectMongoDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(config.database.url, options);
    
    logger.info('MongoDB connected successfully');
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * PostgreSQL Connection
 */
const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: config.env === 'production' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});

const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    
    // Sync models (use migrations in production)
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }
    
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

/**
 * Initialize database connection based on DB_TYPE
 */
const connectDatabase = async () => {
  if (config.database.type === 'mongodb') {
    await connectMongoDB();
  } else if (config.database.type === 'postgresql') {
    await connectPostgreSQL();
  } else {
    throw new Error(`Unsupported database type: ${config.database.type}`);
  }
};

module.exports = {
  connectDatabase,
  mongoose,
  sequelize,
};
