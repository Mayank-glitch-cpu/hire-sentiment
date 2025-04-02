-- 001_create_tables.sql
-- Add pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('applicant', 'recruiter')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applicant_profiles (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  resume TEXT,
  github_url VARCHAR(255),
  leetcode_url VARCHAR(255),
  embedding VECTOR(1536),  -- For OpenAI embeddings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  recruiter_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);