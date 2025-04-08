
import { supabase } from "@/integrations/supabase/client";

// This utility function can be called from the browser console
// or integrated into an admin panel to import GitHub users
export async function importGitHubUsers(users: any[]) {
  try {
    const { data, error } = await supabase.functions.invoke('import-github-users', {
      body: { users }
    });
    
    if (error) {
      console.error("Error importing GitHub users:", error);
      return { success: false, error };
    }
    
    return data;
  } catch (error) {
    console.error("Error importing GitHub users:", error);
    return { success: false, error };
  }
}

// Example of how to use this function
// In browser console:
// import { importGitHubUsers } from "./src/utils/importGitHubUsers";
// const users = [{ username: "user1", name: "User 1", ... }];
// importGitHubUsers(users).then(console.log);
