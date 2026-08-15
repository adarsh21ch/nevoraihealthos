import { createServerFn } from "@tanstack/react-start";

export const checkEnv = createServerFn({ method: "GET" })
  .handler(async () => {
    const keys = Object.keys(process.env);
    const supabaseKeys = keys.filter(k => k.includes('SUPABASE'));
    const details = supabaseKeys.map(k => ({
      key: k,
      present: !!process.env[k],
      length: process.env[k]?.length,
      prefix: process.env[k]?.substring(0, 5)
    }));
    
    return {
      timestamp: new Date().toISOString(),
      supabaseKeys: details
    };
  });
