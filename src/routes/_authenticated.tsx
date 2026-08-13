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

    // Optimization: Return early if already in an admin session (trust cookie/storage)
    // to avoid RPC overhead on every transition
    const existingContext = (window as any).__AUTH_CONTEXT;
    if (existingContext && existingContext.role === 'platform_admin') {
        return { authContext: existingContext };
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
        // Ensure slug consistency - redirect /p/fat-to-fit to /p/fat2fit
        if (location.pathname.startsWith('/p/fat-to-fit')) {
            const newPath = location.pathname.replace('/p/fat-to-fit', '/p/fat2fit');
            throw redirect({ to: newPath as any });
        }


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


