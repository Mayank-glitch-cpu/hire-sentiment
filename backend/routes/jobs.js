// backend/routes/jobs.js
const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user information
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }
  
  try {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    
    // Handle special mock tokens for development environment
    if (process.env.NODE_ENV !== 'production' && token.startsWith('mock_token_')) {
      // Extract user details from mock token
      // Format: mock_token_userId_role (e.g., mock_token_1_recruiter)
      const tokenParts = token.split('_');
      if (tokenParts.length >= 4) {
        const userId = tokenParts[2];
        const role = tokenParts[3];
        
        req.user = { id: userId, role: role };
        return next();
      }
    }
    
    // Normal JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Create a new job
router.post('/', verifyToken, async (req, res) => {
  const { title, company, location, description, requirements } = req.body;
  const recruiterId = req.user.id;
  
  // Validate required fields
  if (!title || !company || !description || !requirements) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }
  
  // Ensure the user is a recruiter
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({
      success: false,
      message: 'Only recruiters can create job listings'
    });
  }
  
  try {
    // Convert requirements string to array if it's passed as a string
    // Split by newlines and filter out empty lines
    let requirementsArray;
    if (typeof requirements === 'string') {
      requirementsArray = requirements.split('\n').filter(line => line.trim() !== '');
    } else if (Array.isArray(requirements)) {
      requirementsArray = requirements;
    } else {
      requirementsArray = [];
    }
    
    const result = await pool.query(
      `INSERT INTO jobs 
       (recruiter_id, title, company, location, description, requirements, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, title, company, location`,
      [recruiterId, title, company, location, description, requirementsArray]
    );
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, company, location, description, requirements, 
              created_at, updated_at
       FROM jobs
       ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      jobs: result.rows
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT id, title, company, location, description, requirements,
              created_at, updated_at
       FROM jobs
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

module.exports = router;