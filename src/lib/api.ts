import axios from 'axios';

// Get the base URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// API endpoints
export const testDbConnection = () => api.get('/test-db');

// User authentication
export const loginUser = (credentials: { email: string; password: string }) => 
  api.post('/auth/login', credentials);

export const registerUser = (userData: { 
  email: string; 
  password: string; 
  role: 'applicant' | 'recruiter';
}) => api.post('/auth/register', userData);

// Applicant endpoints
export const getApplicantProfile = (userId: string) => 
  api.get(`/profile/${userId}`);

export const updateApplicantProfile = (userId: string, profileData: any) => 
  api.put(`/profile/${userId}`, profileData);

// Job endpoints
export const getJobs = () => api.get('/jobs');

export const getJobById = (jobId: string) => 
  api.get(`/jobs/${jobId}`);

export const createJob = (jobData: any) => 
  api.post('/jobs', jobData);

// Application endpoints
export const submitJobApplication = (jobId: string, applicationData: FormData) => {
  return api.post(`/applications/apply/${jobId}`, applicationData, {
    headers: {
      'Content-Type': 'multipart/form-data' // Override for file uploads
    }
  });
};

export const getUserApplications = (userId: string) => 
  api.get(`/applications/user/${userId}`);

export const getApplicationDetails = (applicationId: string) =>
  api.get(`/applications/${applicationId}`);

// Add more API endpoints as needed