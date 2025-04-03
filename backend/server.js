// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const pool = require('./database'); // Import PostgreSQL connection
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const applicationsRoutes = require('./routes/applications');
const personaLensRoutes = require('./routes/persona-lens');
const jobsRoutes = require('./routes/jobs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir);
}

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save resumes in the resumes subdirectory
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, PNG or JPEG are allowed.'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Make upload available to routes
app.locals.upload = upload;

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081', 'http://localhost:8080'], // Allow React frontend and Vite dev server
  credentials: true
})); 
app.use(express.json()); // Parse JSON request bodies

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/auth', authRoutes);
app.use(profileRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/persona-lens', personaLensRoutes);
app.use('/api/jobs', jobsRoutes);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
