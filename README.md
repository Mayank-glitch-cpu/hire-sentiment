# Hire Sentiment

A modern job recruitment platform that connects recruiters with job seekers, featuring sentiment analysis for better matching.

## Features

- Job posting and management for recruiters
- Candidate search and filtering
- User authentication and profiles
- Interactive dashboards for both applicants and recruiters
- Job application tracking
- Profile management with professional links (GitHub, LinkedIn, LeetCode)

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide Icons

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL with pgvector
- **AI Integration**: Google Gemini API
- **Python Services**: Persona-Lens for candidate analysis

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- Python 3.6 or higher
- Docker Desktop
- npm or Bun package manager

### Installation

#### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hire-sentiment
```

2. Install frontend dependencies:
```bash
npm install
# or using Bun
bun install
```

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies for Persona-Lens:
```bash
cd Persona-Lens
pip install -r requirements.txt
```

4. Start the PostgreSQL database using Docker:
```bash
cd ..  # Back to backend directory
docker-compose up -d
```

5. Run database migrations:
```bash
npm run migrate up
```

### Environment Setup

1. Create a `.env` file in the backend directory with the following content:
```env
PGUSER=postgres
PGPASSWORD=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=hiresentiment
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hiresentiment
```

2. Add your Google Gemini API key to `backend/Persona-Lens/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

### Starting the Application

1. Start the backend server (from the backend directory):
```bash
npm run dev
```

2. Start the frontend development server (from the project root):
```bash
npm run dev
# or using Bun
bun dev
```

The frontend application will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:3000`

## Project Structure

### Frontend
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/data` - Mock data and types
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
  - `/pages` - Application pages and routes

### Backend
- `/backend` - Backend services
  - `/migrations` - Database migration files
  - `/routes` - API route handlers
  - `/Persona-Lens` - AI-powered candidate analysis service
    - `/Dataset` - Training and user data
    - `/src` - Core analysis logic

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start backend development server
- `npm run migrate up` - Run database migrations
- `npm run migrate down` - Revert database migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request