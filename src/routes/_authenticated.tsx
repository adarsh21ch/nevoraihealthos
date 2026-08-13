import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // Platform Admin Hardcode - Fastest path for main admin
    if (user.email === 'teamnevorai@gmail.com') {
      return { 
        authContext: {
          role: 'platform_admin',
          onboarding_complete: true,
          tenant_slug: 'fat2fit'
        } 
      };
    }

    // Check session for role to avoid RPC if possible
    // Note: In a production app, we'd store the role in user_metadata or a custom claim
    // For now, we still use the RPC but with better error handling
    try {
      const { data: authContext, error } = await supabase.rpc('get_my_auth_context');
      
      if (error || !authContext) {
        console.warn("Auth context RPC failed, using participant recovery path");
        return {
          authContext: {
            role: 'participant',
            onboarding_complete: false,
            tenant_slug: 'fat2fit'
          }
        };
      }

      const { role, onboarding_complete, tenant_slug } = authContext as any;

      // Gating logic
      if (location.pathname.startsWith('/admin')) {
        if (role !== 'platform_admin' && role !== 'admin') throw redirect({ to: '/login' });
      } else if (location.pathname.startsWith('/coach') || location.pathname.startsWith('/dashboard')) {
        if (role !== 'tenant_owner' && role !== 'coach' && role !== 'admin' && role !== 'platform_admin') throw redirect({ to: '/login' });
      } else if (location.pathname.startsWith('/p/')) {
        if (role === 'participant') {
          if (!onboarding_complete && !location.pathname.includes('/onboarding')) {
              throw redirect({ to: '/onboarding' });
          }
        }
      }
      return { authContext };
    } catch (e) {
      if (e instanceof Error && (e as any).status === 307) throw e;
      console.error("Auth gate error:", e);
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});
