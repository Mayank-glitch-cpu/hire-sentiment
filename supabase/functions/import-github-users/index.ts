
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
    const { users } = await req.json();
    
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Users array is required and must not be empty",
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://mqkxdgadhlrsdvyfudbf.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Process users in batches to generate embeddings and insert into database
    const batchSize = 10;
    const totalUsers = users.length;
    const results = { success: 0, failed: 0, skipped: 0 };
    
    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} (${batch.length} users)...`);
      
      for (const user of batch) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from("github_users")
            .select("id")
            .eq("username", user.username)
            .maybeSingle();
          
          if (existingUser) {
            console.log(`User ${user.username} already exists, skipping...`);
            results.skipped++;
            continue;
          }
          
          // Generate embedding for user profile
          const userText = `
            GitHub user ${user.username}
            Name: ${user.name || ""}
            Bio: ${user.bio || ""}
            Location: ${user.location || ""}
            Public repos: ${user.public_repos || 0}
            Followers: ${user.followers || 0}
            Experience: ${user.experience_years || 0} years
            Skills: ${Array.isArray(user.skills) ? user.skills.join(", ") : ""}
            Languages: ${JSON.stringify(user.languages || {})}
          `;
          
          const embedding = await generateEmbedding(userText);
          
          // Insert user into database
          const { data, error } = await supabase.from("github_users").insert({
            username: user.username,
            name: user.name,
            bio: user.bio,
            location: user.location,
            public_repos: user.public_repos,
            total_stars: user.total_stars,
            followers: user.followers,
            experience_years: user.experience_years,
            popularity_score: user.popularity_score,
            skills: Array.isArray(user.skills) ? user.skills : [],
            languages: user.languages || {},
            github_url: user.github_url || `https://github.com/${user.username}`,
            profile_data: user.profile_data || {},
            embedding
          });
          
          if (error) {
            console.error(`Error inserting user ${user.username}:`, error);
            results.failed++;
          } else {
            console.log(`Successfully inserted user ${user.username}`);
            results.success++;
          }
        } catch (error) {
          console.error(`Error processing user ${user.username}:`, error);
          results.failed++;
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Processed ${totalUsers} users: ${results.success} added, ${results.failed} failed, ${results.skipped} skipped.`
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in import-github-users function:", error);
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
