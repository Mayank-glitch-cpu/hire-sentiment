
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockJobListings } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, Calendar, MapPin } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    github: "",
    linkedin: "",
    leetcode: "",
    researchProfile: "",
    resume: "",
  });

  if (!user || user.role !== "applicant") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as an applicant.</p>
      </div>
    );
  }

  const job = mockJobListings.find(job => job.id === id);

  if (!job) {
    return (
      <div className="container mx-auto py-10">
        <p>Job not found.</p>
        <Button variant="link" onClick={() => navigate("/applicant/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
      
      navigate("/applicant/dashboard");
    } catch (error) {
      toast({
        title: "Failed to submit application",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/applicant/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
            <CardDescription className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              {job.company}
            </CardDescription>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </CardDescription>
            <CardDescription className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Posted on {formatDate(job.postedDate)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p>{job.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          {showApplicationForm ? (
            <Button variant="outline" onClick={() => setShowApplicationForm(false)} className="w-full">
              Cancel Application
            </Button>
          ) : (
            <Button onClick={() => setShowApplicationForm(true)} className="w-full">
              Apply Now
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {showApplicationForm && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for {job.title}</CardTitle>
            <CardDescription>
              Please provide your profile information to apply for this position
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input 
                  id="github" 
                  name="github" 
                  value={applicationData.github} 
                  onChange={handleChange} 
                  required 
                  placeholder="https://github.com/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input 
                  id="linkedin" 
                  name="linkedin" 
                  value={applicationData.linkedin} 
                  onChange={handleChange} 
                  required 
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leetcode">LeetCode URL</Label>
                <Input 
                  id="leetcode" 
                  name="leetcode" 
                  value={applicationData.leetcode} 
                  onChange={handleChange} 
                  placeholder="https://leetcode.com/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="researchProfile">Research Profile URL (if applicable)</Label>
                <Input 
                  id="researchProfile" 
                  name="researchProfile" 
                  value={applicationData.researchProfile} 
                  onChange={handleChange} 
                  placeholder="https://scholar.google.com/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resume">Resume/Experience</Label>
                <Textarea 
                  id="resume" 
                  name="resume" 
                  value={applicationData.resume} 
                  onChange={handleChange} 
                  required 
                  placeholder="Provide a brief summary of your experience, skills, and qualifications for this position..." 
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default JobDetails;
