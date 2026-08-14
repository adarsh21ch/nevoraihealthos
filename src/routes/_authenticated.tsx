import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import * as React from 'react';
import { BrandedLoading } from '@/components/ui/branded-loading';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user;

    if (sessionError || !user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // Platform Admin Hardcode - Fastest path for main admins
    if (user.email === 'teamnevorai@gmail.com') {
      return { 
        authContext: {
          role: 'platform_admin',
          onboarding_complete: true,
          tenant_slug: 'fat2fit'
        } 
      };
    }

    if (user.email === 'krishnaaroraflp@gmail.com') {
      return { 
        authContext: {
          role: 'tenant_owner',
          onboarding_complete: true,
          tenant_slug: 'fat2fit'
        } 
      };
    }

    try {
      const { data: authContext, error } = await supabase.rpc('get_my_auth_context');
      
      if (error || !authContext) {
        console.warn("Auth context RPC failed, using participant recovery path");
        const recoveryContext = {
          role: 'participant',
          onboarding_complete: false,
          tenant_slug: 'fat2fit'
        };
        
        // Prevent loops: if we are on a route that requires more than participant, and RPC failed,
        // redirect to participant dashboard instead of login loop
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner')) {
          throw redirect({ to: '/p/fat2fit/today' as any });
        }
        
        return { authContext: recoveryContext };
      }

      const { role, onboarding_complete, tenant_slug } = authContext as any;

      // Gating logic
      if (location.pathname.startsWith('/admin')) {
        if (role !== 'platform_admin' && role !== 'admin') {
          throw redirect({ to: '/p/fat2fit/today' as any });
        }
      } else if (location.pathname.startsWith('/owner') || location.pathname.startsWith('/coach') || location.pathname.startsWith('/dashboard')) {
        if (role !== 'tenant_owner' && role !== 'coach' && role !== 'admin' && role !== 'platform_admin') {
          throw redirect({ to: '/p/fat2fit/today' as any });
        }
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
      // Only redirect to login if we really have no session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) throw redirect({ to: '/login' });
      throw redirect({ to: '/p/fat2fit/today' as any });
    }
  },
});

function AuthenticatedLayout() {
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Allow session to hydrate from storage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        // Small stabilization delay
        setTimeout(() => {
          if (mounted) setIsInitializing(false);
        }, 600);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isInitializing) {
    return <BrandedLoading />;
  }

  return <Outlet />;
}


