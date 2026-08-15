import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env['HEALTHOS_SUPABASE_URL'] || process.env['SUPABASE_URL'];
  // Prefer the user-provided secret role key, then the newer secret key if available, finally fallback to the legacy service role key
  const SUPABASE_SECRET_KEY = process.env['HEALTHOS_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SECRET_KEYS'] || process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL / HEALTHOS_SUPABASE_URL'] : []),
      ...(!SUPABASE_SECRET_KEY ? ['SUPABASE_SECRET_KEYS / SUPABASE_SERVICE_ROLE_KEY / HEALTHOS_SERVICE_ROLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Please ensure your keys are provided correctly.`;
    
    console.error(`[Supabase Admin Error] ${message}`);
    return null;
  }


  return createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_SECRET_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

/**
 * Proxy object that initializes the Supabase Admin client on first property access.
 * This prevents the entire application from crashing at module load time if 
 * the SUPABASE_SERVICE_ROLE_KEY is missing (e.g., during signup or non-admin paths).
 */
export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop, receiver) {
    if (_supabaseAdmin === undefined) _supabaseAdmin = createSupabaseAdminClient();
    
    if (_supabaseAdmin === null) {
      throw new Error("SUPABASE CONNECTION ERROR: Admin client could not be initialized. Please verify your HEALTHOS_SUPABASE_URL and HEALTHOS_SERVICE_ROLE_KEY.");
    }
    
    const value = Reflect.get(_supabaseAdmin, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(_supabaseAdmin);
    }
    return value;
  },
});
