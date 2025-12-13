// Cloudinary configuration
// This file assumes cloudinary package is installed
// npm install cloudinary

// Load environment variables
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Log configuration for debugging (without exposing secrets)
console.log('Cloudinary configuration:');
console.log('- Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? '[SET]' : '[NOT SET]');
console.log('- API key:', process.env.CLOUDINARY_API_KEY ? '[SET]' : '[NOT SET]');
console.log('- API secret:', process.env.CLOUDINARY_API_SECRET ? '[SET]' : '[NOT SET]');

module.exports = cloudinary;