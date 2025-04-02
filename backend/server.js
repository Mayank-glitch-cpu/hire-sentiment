// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./database'); // Import PostgreSQL connection

// Import routes
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081', 'http://localhost:8080'], // Allow React frontend and Vite dev server
  credentials: true
})); 
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', authRoutes);

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Query PostgreSQL for current timestamp
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});