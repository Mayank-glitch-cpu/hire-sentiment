
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import NavBar from "./components/NavBar";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import PostJob from "./pages/recruiter/PostJob";
import FindCandidates from "./pages/recruiter/FindCandidates";

// Applicant Pages
import ApplicantDashboard from "./pages/applicant/Dashboard";
import JobDetails from "./pages/applicant/JobDetails";
import Profile from "./pages/applicant/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Recruiter Routes */}
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/post-job" element={<PostJob />} />
                <Route path="/recruiter/find-candidates" element={<FindCandidates />} />
                
                {/* Applicant Routes */}
                <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
                <Route path="/applicant/job/:id" element={<JobDetails />} />
                <Route path="/applicant/profile" element={<Profile />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
