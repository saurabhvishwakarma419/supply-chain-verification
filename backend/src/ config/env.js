// ============================================================================
// FILE: src/config/env.js
// Environment variables validation and configuration
// ============================================================================

const dotenv = require('dotenv');
const Joi = require('joi');

// Load environment variables from .env file
dotenv.config();

// Define validation schema for environment variables
const envSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),
  
  // Database
  DATABASE_URL: Joi.string().required().description('MongoDB or PostgreSQL connection string'),
  DB_TYPE: Joi.string().valid('mongodb', 'postgresql').default('mongodb'),
  
  // JWT Authentication
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRE: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRE: Joi.string().default('30d'),
  
  // Blockchain
  BLOCKCHAIN_NETWORK: Joi.string().valid('ethereum', 'solana', 'polygon').default('ethereum'),
  BLOCKCHAIN_RPC_URL: Joi.string().uri().required(),
  CONTRACT_ADDRESS: Joi.string().required(),
  PRIVATE_KEY: Joi.string().required().description('Deployer wallet private key'),
  GAS_LIMIT: Joi.number().default(300000),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().required(),
  
  // IPFS (Optional)
  IPFS_HOST: Joi.string().default('ipfs.infura.io'),
  IPFS_PORT: Joi.number().default(5001),
  IPFS_PROTOCOL: Joi.string().valid('http', 'https').default('https'),
  IPFS_PROJECT_ID: Joi.string().allow(''),
  IPFS_PROJECT_SECRET: Joi.string().allow(''),
  
  // Email Service
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  
  // SMS Service (Twilio)
  TWILIO_ACCOUNT_SID: Joi.string().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().allow(''),
  TWILIO_PHONE_NUMBER: Joi.string().allow(''),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('*'),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Redis (for caching and sessions)
  REDIS_URL: Joi.string().uri().allow(''),
  
  // Frontend URL
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export validated environment variables
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiVersion: envVars.API_VERSION,
  
  database: {
    url: envVars.DATABASE_URL,
    type: envVars.DB_TYPE,
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpire: envVars.JWT_REFRESH_EXPIRE,
  },
  
  blockchain: {
    network: envVars.BLOCKCHAIN_NETWORK,
    rpcUrl: envVars.BLOCKCHAIN_RPC_URL,
    contractAddress: envVars.CONTRACT_ADDRESS,
    privateKey: envVars.PRIVATE_KEY,
    gasLimit: envVars.GAS_LIMIT,
  },
  
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
  
  ipfs: {
    host: envVars.IPFS_HOST,
    port: envVars.IPFS_PORT,
    protocol: envVars.IPFS_PROTOCOL,
    projectId: envVars.IPFS_PROJECT_ID,
    projectSecret: envVars.IPFS_PROJECT_SECRET,
  },
  
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      user: envVars.SMTP_USER,
      password: envVars.SMTP_PASSWORD,
    },
    from: envVars.EMAIL_FROM,
  },
  
  sms: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
  },
  
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
  },
  
  redis: {
    url: envVars.REDIS_URL,
  },
  
  frontendUrl: envVars.FRONTEND_URL,
};
