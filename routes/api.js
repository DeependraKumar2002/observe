const express = require('express');
const router = express.Router();
const Inspection = require('../models/Inspection');
const staticUsers = require('../config/staticUsers');

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