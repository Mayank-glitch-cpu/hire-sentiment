
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@^0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;
    
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters = {} } = await req.json();
    console.log("Received search query:", query);
    
    // Check if query is provided
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Query string is required",
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate embedding for the search query
    console.log("Generating embedding for query...");
    const embedding = await generateEmbedding(query);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://mqkxdgadhlrsdvyfudbf.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search for candidates using vector similarity
    console.log("Searching for candidates...");
    const { data: candidates, error } = await supabase.rpc(
      "match_github_users",
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10
      }
    );
    
    if (error) {
      throw error;
    }
    
    // Process and enhance results with Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    console.log("Enhancing results with Gemini...");
    const prompt = `
      You are an expert recruiter assistant helping to match candidates to job requirements.
      Based on the search query: "${query}"
      And these candidate profiles:
      ${JSON.stringify(candidates, null, 2)}
      
      Provide a brief analysis of the top 3 candidates that best match the query. 
      Return your response as valid JSON with this structure:
      {
        "analysis": "Your overall analysis of the match quality",
        "topCandidates": [
          {
            "username": "candidate username",
            "matchReason": "Specific reason why this candidate is a good match",
            "strengths": ["strength1", "strength2"],
            "potential_concerns": ["concern1", "concern2"]
          }
        ]
      }
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let enhancedResults;
    
    try {
      enhancedResults = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      enhancedResults = { 
        analysis: "Unable to generate analysis",
        topCandidates: []
      };
    }
    
    // Return the combined results
    return new Response(
      JSON.stringify({
        success: true,
        candidates,
        enhancedResults
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in search-candidates function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
