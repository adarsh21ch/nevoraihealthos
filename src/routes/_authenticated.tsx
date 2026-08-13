import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    const { data: authContext, error: rpcError } = await supabase.rpc('get_my_auth_context');
    
    // Recovery path if RPC fails or returns null
    const recoveryContext = {
      role: user.email === 'teamnevorai@gmail.com' ? 'platform_admin' : 'participant',
      onboarding_complete: false,
      tenant_slug: 'fat2fit'
    };

    const effectiveContext = (authContext ?? recoveryContext) as any;
    const { role, onboarding_complete } = effectiveContext;

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
    return { authContext: effectiveContext };
  },
  component: () => <Outlet />,
});
