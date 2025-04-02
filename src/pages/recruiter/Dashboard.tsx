
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockJobListings } from "@/data/mockData";
import { PlusCircle, Search } from "lucide-react";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "recruiter") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as a recruiter.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <div className="space-x-4">
          <Button onClick={() => navigate("/recruiter/find-candidates")} className="bg-accent text-primary">
            <Search className="mr-2 h-4 w-4" />
            Find Candidates
          </Button>
          <Button onClick={() => navigate("/recruiter/post-job")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Job Listings</CardTitle>
            <CardDescription>Manage your active job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockJobListings.length > 0 ? (
                mockJobListings.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                        <p className="text-sm mt-2">{job.description.substring(0, 150)}...</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/recruiter/job/${job.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Posted jobs will appear here. Click on a job to view details and applicants.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
