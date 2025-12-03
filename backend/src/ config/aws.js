// FILE: src/config/aws.js
// AWS S3 configuration for file storage
// ============================================================================

const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('./env');
const logger = require('../utils/logger');
const crypto = require('crypto');
const path = require('path');

// Configure AWS SDK v2 (legacy)
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

// Initialize S3 Client (AWS SDK v3)
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} mimeType - File MIME type
 * @param {String} folder - S3 folder path (optional)
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = 'uploads') => {
  try {
    // Generate unique file name
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const s3Key = `${folder}/${uniqueFileName}`;
    
    const uploadParams = {
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Change to 'private' if needed
    };
    
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    const fileUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;
    
    logger.info(`File uploaded to S3: ${s3Key}`);
    
    return {
      key: s3Key,
      url: fileUrl,
      bucket: config.aws.s3Bucket,
      fileName: uniqueFileName,
    };
    
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Get file from S3
 * @param {String} key - S3 object key
 */
const getFromS3 = async (key) => {
  try {
    const getParams = {
      Bucket: config.aws.s3Bucket,
      Key: key,
    };
    
    const command = new GetObjectCommand(getParams);
    const data = await s3Client.send(command);
    
    return data.Body;
    
  } catch (error) {
    logger.error('S3 get error:', error);
    throw new Error(`Failed to get file from S3: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {String} key - S3 object key
 */
const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: config.aws.s3Bucket,
      Key: key,
    };
    
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    
    logger.info(`File deleted from S3: ${key}`);
    
    return { success: true, key };
    
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Generate presigned URL for temporary access
 * @param {String} key - S3 object key
 * @param {Number} expiresIn - URL expiration time in seconds (default: 1 hour)
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    
    return url;
    
  } catch (error) {
    logger.error('Presigned URL generation error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects {buffer, fileName, mimeType}
 * @param {String} folder - S3 folder path
 */
const uploadMultipleToS3 = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToS3(file.buffer, file.fileName, file.mimeType, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    logger.info(`${results.length} files uploaded to S3`);
    
    return results;
    
  } catch (error) {
    logger.error('Multiple S3 upload error:', error);
    throw error;
  }
};

/**
 * Check if file exists in S3
 * @param {String} key - S3 object key
 */
const fileExistsInS3 = async (key) => {
  try {
    await s3Client.send(new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
    throw error;
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  getFromS3,
  deleteFromS3,
  getPresignedUrl,
  uploadMultipleToS3,
  fileExistsInS3,
};
