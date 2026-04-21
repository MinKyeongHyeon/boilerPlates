"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!_client) {
    const supabaseUrl = env.supabaseUrl || "https://placeholder.supabase.co";
    const supabaseAnonKey = env.supabaseAnonKey || "placeholder-anon-key";
    
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    return getClient()[prop as keyof ReturnType<typeof createClient>];
  }
});
