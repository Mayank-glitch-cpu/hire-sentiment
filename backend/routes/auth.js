// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Make sure jwt is imported

// Register a new user
router.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  try {
    const { email, password, role } = req.body;
    
    console.log('Processing registration for:', { email, role });

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Insert new user into database
    const newUser = await pool.query(
      'INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, email, role, created_at',
      [email, hashedPassword, role]
    );

    console.log('User created successfully:', newUser.rows[0].id);

    // Create token for the new user
    const token = jwt.sign(
      { 
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // If user is an applicant, create an empty applicant profile
    if (role === 'applicant') {
      console.log('Creating applicant profile for user:', newUser.rows[0].id);
      await pool.query(
        'INSERT INTO applicant_profiles (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP)',
        [newUser.rows[0].id]
      );
      console.log('Applicant profile created successfully');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        created_at: newUser.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];
    console.log('User found:', user.id);

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Login successful:', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Send user details and token
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

module.exports = router;