
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { mockApplicants } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

const FindCandidates = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI talent assistant. Ask me to find candidates matching specific skills or requirements.",
      sender: "ai",
      timestamp: Date.now(),
    },
  ]);
  const [results, setResults] = useState<typeof mockApplicants>([]);

  if (!user || user.role !== "recruiter") {
    return (
      <div className="container mx-auto py-10">
        <p>You don't have access to this page. Please login as a recruiter.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const userMessage: Message = {
      text: query,
      sender: "user",
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search functionality
      let searchResults = [];
      const lowercaseQuery = query.toLowerCase();
      
      // Simple search algorithm based on keywords
      if (lowercaseQuery.includes("python")) {
        searchResults = mockApplicants.filter(applicant => 
          applicant.skills.some(skill => skill.toLowerCase().includes("python"))
        );
      } else if (lowercaseQuery.includes("react") || lowercaseQuery.includes("frontend")) {
        searchResults = mockApplicants.filter(applicant => 
          applicant.skills.some(skill => 
            ["react", "javascript", "typescript", "frontend"].includes(skill.toLowerCase())
          )
        );
      } else if (lowercaseQuery.includes("top") || lowercaseQuery.includes("best")) {
        // If asking for top candidates, return all sorted by number of skills
        searchResults = [...mockApplicants].sort((a, b) => b.skills.length - a.skills.length);
        if (lowercaseQuery.includes("3")) {
          searchResults = searchResults.slice(0, 3);
        } else {
          searchResults = searchResults.slice(0, Math.min(5, searchResults.length));
        }
      } else {
        // Default to returning all candidates
        searchResults = mockApplicants;
      }
      
      setResults(searchResults);
      
      // Generate AI response
      const aiResponse: Message = {
        text: generateAIResponse(query, searchResults),
        sender: "ai",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setQuery("");
    } catch (error) {
      console.error("Error searching candidates:", error);
      
      const errorMessage: Message = {
        text: "Sorry, I encountered an error while searching for candidates. Please try again.",
        sender: "ai",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (query: string, results: typeof mockApplicants) => {
    if (results.length === 0) {
      return "I couldn't find any candidates matching your criteria. Try broadening your search or using different keywords.";
    }
    
    const queryLower = query.toLowerCase();
    let response = "";
    
    if (queryLower.includes("python")) {
      response = `I found ${results.length} Python developers matching your criteria. You can see their profiles in the Candidates tab.`;
    } else if (queryLower.includes("react") || queryLower.includes("frontend")) {
      response = `I found ${results.length} frontend developers with React experience. Check out their profiles in the Candidates tab.`;
    } else if (queryLower.includes("top") || queryLower.includes("best")) {
      response = `Here are the top candidates based on skill match and experience. You can review their complete profiles in the Candidates tab.`;
    } else {
      response = `I found ${results.length} candidates that might match your needs. You can explore their profiles in the Candidates tab.`;
    }
    
    return response;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Helper function to get profile image URL for candidates
  const getProfileImageUrl = (candidate: typeof mockApplicants[0]) => {
    // In a real app, this would be an actual image URL from LinkedIn
    // For now, we're using a placeholder image based on the candidate's id
    const candidateIdNum = parseInt(candidate.id);
    return `https://randomuser.me/api/portraits/${candidateIdNum % 2 === 0 ? 'men' : 'women'}/${candidateIdNum % 10}.jpg`;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Find Candidates</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="flex flex-col h-[calc(100vh-200px)]">
          <CardHeader>
            <CardTitle>AI Talent Assistant</CardTitle>
          </CardHeader>
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="mx-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="candidates">
                Candidates
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {results.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="flex-1 flex flex-col">
              <TabsContent value="chat" className="flex-1 flex flex-col space-y-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col p-0">
                <div className="flex-1 overflow-y-auto mb-4 p-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-muted max-w-[80%] rounded-lg p-3">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 p-4 border-t">
                  <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type a query like 'Find me top Python developers'"
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={loading}>
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="candidates" className="flex-1 overflow-y-auto mt-0 data-[state=active]:flex data-[state=active]:flex-col p-0">
                <div className="space-y-4 p-4">
                  {results.length > 0 ? (
                    results.map((candidate) => (
                      <Card key={candidate.id} className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={getProfileImageUrl(candidate)} alt={candidate.name} />
                            <AvatarFallback className="text-lg">
                              {getInitials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{candidate.email}</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm">Skills</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {candidate.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="font-normal">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm">Experience</h4>
                                <ul className="text-sm mt-1">
                                  {candidate.experience.map((exp, index) => (
                                    <li key={index}>{exp}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm">Education</h4>
                                <ul className="text-sm mt-1">
                                  {candidate.education.map((edu, index) => (
                                    <li key={index}>{edu}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm">Profiles</h4>
                                <div className="text-sm mt-1 space-y-1">
                                  <p>GitHub: <a href={`https://${candidate.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{candidate.github}</a></p>
                                  <p>LinkedIn: <a href={`https://${candidate.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{candidate.linkedin}</a></p>
                                  <p>LeetCode: <a href={`https://${candidate.leetcode}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{candidate.leetcode}</a></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No candidates found. Try searching with different criteria.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default FindCandidates;
