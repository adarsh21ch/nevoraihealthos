import { supabase } from "@/integrations/supabase/client";
import { tenantSiteUrl } from "@/lib/tenant";

export type AuthRedirectResult = {
  to: string;
  role: string;
  authContext?: any;
};

/**
 * Unified logic to determine where a user should land based on their role and state.
 * This is the single source of truth for all role-based redirects.
 */
export async function resolveUserDestination(user: any): Promise<AuthRedirectResult> {
  if (!user) {
    return { to: "/login", role: "none" };
  }

  // 1. High-priority hardcoded bypasses for admins
  if (user.email === 'teamnevorai@gmail.com') {
    return { 
      to: "/admin", 
      role: "platform_admin",
      authContext: { role: 'platform_admin', onboarding_complete: true, tenant_slug: 'fat2fit' }
    };
  }

  if (user.email === 'krishnaaroraflp@gmail.com') {
    return { 
      to: "/owner", 
      role: "tenant_owner",
      authContext: { role: 'tenant_owner', onboarding_complete: true, tenant_slug: 'fat2fit' }
    };
  }

  // 2. Database-driven role resolution
  try {
    const { data: authContext, error } = await supabase.rpc('get_my_auth_context');
    
    if (error || !authContext) {
      console.warn("Auth context RPC failed, using participant recovery path");
      return { 
        to: "/onboarding", // Safest default for new/unknown users
        role: "participant",
        authContext: { role: 'participant', onboarding_complete: false, tenant_slug: 'fat2fit' }
      };
    }

    const { role, onboarding_complete, tenant_slug, custom_domain } = authContext as any;
    
    if (role === "platform_admin" || role === "admin") {
      return { to: "/admin", role: "platform_admin", authContext };
    }
    
    if (role === "tenant_owner") {
      return { to: "/owner", role: "tenant_owner", authContext };
    }

    // Participant routing
    const effectiveSlug = tenant_slug || "fat2fit";
    const targetUrl = tenantSiteUrl({ slug: effectiveSlug, custom_domain });
    const path = onboarding_complete ? "/today" : "/onboarding";
    
    // For participants, we use the specific path including tenant slug if applicable
    // But within the app (client-side routing), we often use /p/$tenantSlug/today
    const internalTo = onboarding_complete 
      ? `/p/${effectiveSlug}/today`
      : "/onboarding";

    return { 
      to: internalTo, 
      role: role || "participant", 
      authContext 
    };
  } catch (e) {
    console.error("Failed to resolve user destination:", e);
    return { to: "/onboarding", role: "participant" };
  }
}
