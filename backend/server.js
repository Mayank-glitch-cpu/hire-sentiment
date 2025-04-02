
// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const pool = require('./database'); // Import PostgreSQL connection
const profileRoutes = require('./routes/profile');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow React frontend
app.use(express.json()); // Parse JSON request bodies

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use(profileRoutes);

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

// Smart Hire API route - connects to Persona-Lens
app.post('/api/smart-hire/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // In a real implementation, this would call the Persona-Lens API
    // For now, we'll return mock data
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.json({
      success: true,
      results: {
        query: query,
        candidates: [
          // Mock candidates would be returned here
          // This would be based on the Persona-Lens RAG system
        ],
        analysis: "Based on your query, we've ranked candidates by their Python expertise, GitHub contributions, and overall experience.",
      }
    });
  } catch (error) {
    console.error('Error in Smart Hire search:', error);
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
