/**
 * Script to test image upload endpoint directly
 * This helps isolate backend issues from frontend issues
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Cloudinary configuration for comparison
const cloudinary = require('./config/cloudinary');

async function testImageUpload() {
    console.log('=== Image Upload Test ===');

    try {
        // Test Cloudinary connectivity first
        console.log('Testing Cloudinary connectivity...');
        const pingResult = await cloudinary.api.ping();
        console.log('Cloudinary ping result:', pingResult);

        // Read a test image file (you need to have a test image)
        const testImagePath = path.join(__dirname, 'test-image.jpg');

        // Check if test image exists
        if (!fs.existsSync(testImagePath)) {
            console.log('Test image not found at:', testImagePath);
            console.log('Please place a test image named "test-image.jpg" in the backend directory');
            return;
        }

        console.log('Reading test image...');
        const imageBuffer = fs.readFileSync(testImagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        console.log('Base64 image length:', base64Image.length);

        // Test direct Cloudinary upload
        console.log('Testing direct Cloudinary upload...');
        const directUploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: 'inspection-images-test',
            use_filename: true,
            unique_filename: false
        });

        console.log('Direct Cloudinary upload result:', {
            secure_url: directUploadResult.secure_url,
            public_id: directUploadResult.public_id
        });

        // Test API endpoint
        console.log('Testing API endpoint upload...');
        const apiUrl = `http://localhost:${process.env.PORT || 5000}/api/upload-base64-image`;

        console.log('API URL:', apiUrl);

        const apiResponse = await axios.post(apiUrl, {
            image: base64Image
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API response status:', apiResponse.status);
        console.log('API response data:', JSON.stringify(apiResponse.data, null, 2));

        if (apiResponse.data && apiResponse.data.success) {
            console.log('✅ API upload test PASSED');
            console.log('Uploaded image URL:', apiResponse.data.data.url);
        } else {
            console.log('❌ API upload test FAILED');
            console.log('Error message:', apiResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Response status:', error.response.status);
        }
    }
}

// Run the test
testImageUpload();