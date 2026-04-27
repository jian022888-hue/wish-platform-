import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     !supabaseUrl.includes("placeholder");

export function createClient() {
  if (!isConfigured) {
    // Return a mock client when Supabase is not configured
    return {
      auth: {
        signUp: async () => ({ 
          data: null, 
          error: { message: "Supabase 未配置，请先在 .env.local 中配置真实的项目信息" } 
        }),
        signInWithPassword: async () => ({ 
          data: null, 
          error: { message: "Supabase 未配置，请先在 .env.local 中配置真实的项目信息" } 
        }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        exchangeCodeForSession: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: () => ({ data: null, error: null }),
        single: () => ({ data: null, error: null }),
        order: () => ({ data: null, error: null }),
      }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export { isConfigured };
