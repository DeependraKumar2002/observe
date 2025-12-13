const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
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
// @desc    Submit inspection form
// @access  Public
router.post('/inspection', async (req, res) => {
  try {
    const inspectionData = req.body;

    // Create new inspection record
    const inspection = new Inspection(inspectionData);
    await inspection.save();

    res.status(201).json({
      success: true,
      message: 'Inspection submitted successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Inspection submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inspection',
      error: error.message
    });
  }
});

// @route   POST /api/upload-image
// @desc    Upload image to Cloudinary
// @access  Public
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'inspection-images',
      use_filename: true,
      unique_filename: false
    });

    // Delete local file after upload
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// @route   POST /api/upload-base64-image
// @desc    Upload base64 image to Cloudinary
// @access  Public
router.post('/upload-base64-image', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'inspection-images',
      use_filename: true,
      unique_filename: false
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Base64 image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
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
    const {
      examStartDate,
      examStartTime,
      examEndDate,
      examEndTime,
      downloadDate,
      downloadTime,
      randomSeatAllocation,
      seatChangeRequest
    } = req.body;

    // Find existing inspection
    const inspection = await Inspection.findById(id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Update only the During Exam section fields
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

module.exports = router;