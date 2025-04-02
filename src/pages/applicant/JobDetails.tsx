
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockJobListings } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";

const applicationSchema = z.object({
  githubUrl: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.literal('')),
  leetcodeUrl: z.string().url({ message: "Please enter a valid LeetCode URL" }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL" }).optional().or(z.literal('')),
  coverLetter: z.string().optional(),
});

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const job = mockJobListings.find(job => job.id === id);

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      githubUrl: "",
      leetcodeUrl: "",
      linkedinUrl: "",
      coverLetter: "",
    },
  });

  if (!user || user.role !== "applicant") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as an applicant.</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-10">
        <p>Job not found.</p>
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to apply for this job.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the values and resumeFile to the backend
      console.log("Form values:", values);
      console.log("Resume file:", resumeFile);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Application Submitted!",
        description: "Your application for " + job.title + " has been submitted successfully.",
      });
      
      // Reset form
      form.reset();
      setResumeFile(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Failed to Submit Application",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setResumeFile(file);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <CardDescription className="text-base">
                    {job.company} • {job.location}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="mt-1">{job.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold">Salary</h3>
                  <p className="text-md">{job.salary}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Experience</h3>
                  <p className="text-md">{job.experience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Posted</h3>
                  <p className="text-md">{job.postedDate}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-base whitespace-pre-line">{job.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Apply for this position</CardTitle>
              <CardDescription>
                Complete the form below to submit your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume" className="text-base">Resume *</Label>
                      <div className="mt-1.5">
                        <FileUpload 
                          onFileUpload={handleFileUpload}
                          onClear={() => setResumeFile(null)}
                          allowedTypes={[
                            'application/pdf', 
                            'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'image/png', 
                            'image/jpeg'
                          ]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Upload your resume in PDF, DOC, PNG, or JPEG format
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="leetcodeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LeetCode URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://leetcode.com/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/yourusername" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us why you're interested in this position..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Optional, but recommended
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
