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

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide Icons

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or Bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hire-sentiment
```

2. Install dependencies:
```bash
npm install
# or if using Bun
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/data` - Mock data and types
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
  - `/pages` - Application pages and routes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request