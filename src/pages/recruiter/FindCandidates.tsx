import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

interface Candidate {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  experience_years: number | null;
  popularity_score: number | null;
  languages: Record<string, any> | null;
  skills: string[] | null;
  public_repos: number | null;
  total_stars: number | null;
  followers: number | null;
  location: string | null;
  github_url: string | null;
  similarity: number;
}

interface EnhancedResults {
  analysis: string;
  topCandidates: {
    username: string;
    matchReason: string;
    strengths: string[];
    potential_concerns: string[];
  }[];
}

const FindCandidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI talent assistant powered by Gemini. Ask me to find candidates matching specific skills or requirements.",
      sender: "ai",
      timestamp: Date.now(),
    },
  ]);
  const [results, setResults] = useState<Candidate[]>([]);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedResults | null>(null);

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
      // Call the Supabase edge function for search
      const { data, error } = await supabase.functions.invoke('search-candidates', {
        body: { query }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Unknown error occurred');
      }
      
      // Update state with search results
      setResults(data.candidates || []);
      setEnhancedResults(data.enhancedResults || null);
      
      // Generate AI response
      const aiResponse: Message = {
        text: data.enhancedResults?.analysis || generateDefaultResponse(data.candidates || []),
        sender: "ai",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setQuery("");
    } catch (error) {
      console.error("Error searching candidates:", error);
      
      const errorMessage: Message = {
        text: `Sorry, I encountered an error while searching for candidates: ${error.message}. Please try again.`,
        sender: "ai",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Search Error",
        description: "Failed to search for candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultResponse = (candidates: Candidate[]): string => {
    if (candidates.length === 0) {
      return "I couldn't find any candidates matching your criteria. Try broadening your search or using different keywords.";
    }
    
    const queryLower = query.toLowerCase();
    let response = "";
    
    if (queryLower.includes("python")) {
      response = `I found ${candidates.length} Python developers matching your criteria. You can see their profiles in the Candidates tab.`;
    } else if (queryLower.includes("react") || queryLower.includes("frontend")) {
      response = `I found ${candidates.length} frontend developers with React experience. Check out their profiles in the Candidates tab.`;
    } else if (queryLower.includes("top") || queryLower.includes("best")) {
      response = `Here are the top candidates based on skill match and experience. You can review their complete profiles in the Candidates tab.`;
    } else {
      response = `I found ${candidates.length} candidates that might match your needs. You can explore their profiles in the Candidates tab.`;
    }
    
    return response;
  };

  const getInitials = (name: string = "User"): string => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Helper function to get profile image URL for candidates
  const getProfileImageUrl = (candidate: Candidate): string => {
    // If the candidate has a GitHub username, use GitHub avatar URL
    if (candidate.username) {
      return `https://github.com/${candidate.username}.png`;
    }
    
    // Otherwise use a placeholder image
    const candidateId = parseInt(candidate.id.substring(0, 8), 16);
    return `https://randomuser.me/api/portraits/${candidateId % 2 === 0 ? 'men' : 'women'}/${candidateId % 10}.jpg`;
  };

  const formatLanguages = (languages: Record<string, any> | null): JSX.Element[] => {
    if (!languages) return [];
    
    return Object.entries(languages)
      .slice(0, 5)
      .map(([lang, value], i) => (
        <Badge key={i} variant="secondary" className="font-normal">
          {lang} {typeof value === 'number' && value > 1 ? `(${value})` : ''}
        </Badge>
      ));
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
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="candidates" className="flex-1 overflow-y-auto mt-0 data-[state=active]:flex data-[state=active]:flex-col p-0">
                {enhancedResults && enhancedResults.topCandidates.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border-b">
                    <h3 className="font-semibold mb-2">Top Candidates Analysis</h3>
                    <p className="text-sm mb-3">{enhancedResults.analysis}</p>
                    <div className="space-y-3">
                      {enhancedResults.topCandidates.map((candidate, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-blue-500 pl-3">
                          <div className="font-medium">{candidate.username}</div>
                          <div className="italic">{candidate.matchReason}</div>
                          <div className="mt-1">
                            <span className="font-medium">Strengths: </span>
                            {candidate.strengths.join(', ')}
                          </div>
                          {candidate.potential_concerns.length > 0 && (
                            <div>
                              <span className="font-medium">Considerations: </span>
                              {candidate.potential_concerns.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              
                <div className="space-y-4 p-4">
                  {results.length > 0 ? (
                    results.map((candidate) => (
                      <Card key={candidate.id} className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={getProfileImageUrl(candidate)} alt={candidate.name || candidate.username} />
                            <AvatarFallback className="text-lg">
                              {getInitials(candidate.name || candidate.username)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold">{candidate.name || candidate.username}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {candidate.location && `${candidate.location} • `}
                                  {candidate.experience_years && `${candidate.experience_years} years experience`}
                                </p>
                              </div>
                              {candidate.similarity && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  {Math.round(candidate.similarity * 100)}% match
                                </Badge>
                              )}
                            </div>
                            
                            {candidate.bio && (
                              <p className="text-sm my-2">{candidate.bio}</p>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <h4 className="font-medium text-sm">Languages</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formatLanguages(candidate.languages)}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm">Skills</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {candidate.skills?.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="font-normal">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm">Stats</h4>
                                <div className="text-sm mt-1 grid grid-cols-2 gap-2">
                                  <div>Repositories: {candidate.public_repos || 0}</div>
                                  <div>Stars: {candidate.total_stars || 0}</div>
                                  <div>Followers: {candidate.followers || 0}</div>
                                  <div>Popularity: {candidate.popularity_score ? `${Math.round(candidate.popularity_score * 10)}/10` : 'N/A'}</div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm">Links</h4>
                                <div className="text-sm mt-1">
                                  {candidate.github_url && (
                                    <p>
                                      <a 
                                        href={candidate.github_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-primary hover:underline flex items-center gap-1"
                                      >
                                        GitHub Profile
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t flex justify-end">
                              <Button variant="outline" size="sm">
                                View Full Profile
                              </Button>
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
