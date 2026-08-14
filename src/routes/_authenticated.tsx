import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { resolveUserDestination } from '@/lib/auth-gate';
import * as React from 'react';
import { BrandedLoading } from '@/components/ui/branded-loading';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    // 1. Storage check (sync) to avoid hydration races
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // 2. Resolve destination using unified logic
    const { to, authContext, role } = await resolveUserDestination(session.user);

    // 3. Authorization check
    // If unified logic says we should be somewhere else, redirect there
    // But allow /p/* routes if role is participant, etc.
    const isDashboardPath = location.pathname.startsWith('/p/') || 
                          location.pathname === '/today' || 
                          location.pathname === '/onboarding';

    if (location.pathname.startsWith('/admin') && role !== 'platform_admin' && role !== 'admin') {
      throw redirect({ to: to as any });
    }
    
    if (location.pathname.startsWith('/owner') && role !== 'tenant_owner' && role !== 'admin' && role !== 'platform_admin') {
      throw redirect({ to: to as any });
    }

    // Special case: if we are on login or root and already have a destination
    if (location.pathname === '/' || location.pathname === '/login') {
       throw redirect({ to: to as any });
    }

    return { authContext };
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


