// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../database'); // Import the config

router.post('/api/profile', async (req, res) => {
  const { userId, resume } = req.body;
  try {
    await pool.query(
      'INSERT INTO applicant_profiles (user_id, resume) VALUES ($1, $2)',
      [userId, resume]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});