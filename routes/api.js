const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const ChatMessage = require('../models/ChatMessage'); // Import ChatMessage model
const staticUsers = require('../config/staticUsers');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @route   POST /api/login
// @desc    Login observer
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user in static users
    const user = staticUsers.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Return user data (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        email: user.email,
        centerName: user.centerName,
        centerCode: user.centerCode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inspection
// @desc    Submit new inspection
// @access  Public
router.post('/inspection', async (req, res) => {
  try {
    const inspectionData = req.body;

    // Validate required fields
    if (!inspectionData.observerEmail || !inspectionData.centerName || !inspectionData.centerCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new inspection
    const newInspection = new Inspection(inspectionData);
    const savedInspection = await newInspection.save();

    res.status(201).json({
      success: true,
      message: 'Inspection submitted successfully',
      data: savedInspection
    });
  } catch (error) {
    console.error('Inspection submission error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Inspection validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit inspection',
      error: error.message
    });
  }
});

// @route   PUT /api/inspection/:id/during-exam
// @desc    Update During Exam section of existing inspection
// @access  Public
router.put('/inspection/:id/during-exam', async (req, res) => {
  try {
    const { id } = req.params;
    const duringExamData = req.body;

    // Find the inspection by ID
    const inspection = await Inspection.findById(id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Update only the During Exam section fields
    const {
      examStartDate,
      examStartTime,
      examEndDate,
      examEndTime,
      downloadDate,
      downloadTime,
      randomSeatAllocation,
      seatChangeRequest
    } = duringExamData;

    if (examStartDate !== undefined) inspection.examStartDate = examStartDate;
    if (examStartTime !== undefined) inspection.examStartTime = examStartTime;
    if (examEndDate !== undefined) inspection.examEndDate = examEndDate;
    if (examEndTime !== undefined) inspection.examEndTime = examEndTime;
    if (downloadDate !== undefined) inspection.downloadDate = downloadDate;
    if (downloadTime !== undefined) inspection.downloadTime = downloadTime;
    if (randomSeatAllocation !== undefined) inspection.randomSeatAllocation = randomSeatAllocation;
    if (seatChangeRequest !== undefined) inspection.seatChangeRequest = seatChangeRequest;

    // Update the submittedAt timestamp
    inspection.submittedAt = Date.now();

    // Save the updated inspection
    await inspection.save();

    res.json({
      success: true,
      message: 'During Exam section updated successfully',
      data: inspection
    });
  } catch (error) {
    console.error('During Exam update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update During Exam section',
      error: error.message
    });
  }
});

// @route   GET /api/inspections
// @desc    Get all inspections (optional - for admin/review)
// @access  Public
router.get('/inspections', async (req, res) => {
  try {
    const { email } = req.query;

    let query = {};
    if (email) {
      query.observerEmail = email;
    }

    const inspections = await Inspection.find(query).sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspections'
    });
  }
});

// @route   GET /api/inspections/:id
// @desc    Get single inspection by ID
// @access  Public
router.get('/inspections/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    console.error('Get inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection'
    });
  }
});

// @route   POST /api/chat/message
// @desc    Save a chat message to MongoDB
// @access  Public
router.post('/chat/message', async (req, res) => {
  try {
    const { userEmail, centerCode, message, sender } = req.body;

    if (!userEmail || !centerCode || !message || !sender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new chat message
    const chatMessage = new ChatMessage({
      userEmail,
      centerCode,
      text: message,
      sender
    });

    // Save to MongoDB
    const savedMessage = await chatMessage.save();

    res.json({
      success: true,
      message: 'Message saved successfully',
      data: savedMessage
    });
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save message'
    });
  }
});

// @route   GET /api/chat/messages/:userEmail/:centerCode
// @desc    Get chat messages for a user from MongoDB
// @access  Public
router.get('/chat/messages/:userEmail/:centerCode', async (req, res) => {
  try {
    const { userEmail, centerCode } = req.params;


    // Find messages for this user and center, sorted by timestamp
    const messages = await ChatMessage.find({
      userEmail,
      centerCode
    }).sort({ timestamp: 1 }); // Ascending order
    console.log(messages)

    res.json({
      success: "true",
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   GET /api/chat/admin/messages
// @desc    Get all admin messages (optionally filter by centerCode)
// @access  Public (can secure later)
router.get('/chat/admin/messages', async (req, res) => {
  try {
    const { centerCode } = req.query;

    const query = { sender: 'admin' };

    if (centerCode) {
      query.centerCode = centerCode;
    }

    const messages = await ChatMessage.find(query).sort({ timestamp: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get admin chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin messages'
    });
  }
});

// @route   DELETE /api/chat/messages/:userEmail/:centerCode
// @desc    Clear chat messages for a user from MongoDB
// @access  Public
router.delete('/chat/messages/:userEmail/:centerCode', async (req, res) => {
  try {
    const { userEmail, centerCode } = req.params;

    // Delete all messages for this user and center
    const result = await ChatMessage.deleteMany({
      userEmail,
      centerCode
    });

    res.json({
      success: true,
      message: `Chat history cleared (${result.deletedCount} messages deleted)`
    });
  } catch (error) {
    console.error('Clear chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
});

// @route   POST /api/upload-base64-image
// @desc    Upload base64 image to Cloudinary
// @access  Public
router.post('/upload-base64-image', async (req, res) => {
  try {
    const { image } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Validate base64 format
    if (!image.startsWith('data:image')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Must be base64 data URI'
      });
    }

    console.log('Uploading image to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'inspection-images',
      use_filename: true,
      unique_filename: false,
      overwrite: false
    });

    console.log('Image uploaded to Cloudinary:', result.secure_url);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message
    });
  }
});

module.exports = router;