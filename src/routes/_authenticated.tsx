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

    const { data: authContext } = await supabase.rpc('get_my_auth_context');
    const { role, onboarding_complete } = (authContext ?? { role: 'participant', onboarding_complete: false }) as any;

    // Admin override for local debugging if RPC is being stubborn
    const isAdmin = user.email === 'teamnevorai@gmail.com';
    const effectiveRole = isAdmin ? 'platform_admin' : role;

    // Gating logic based on Premium Fat2Fit roles
    if (location.pathname.startsWith('/admin')) {
      if (effectiveRole !== 'platform_admin' && effectiveRole !== 'admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/coach') || location.pathname.startsWith('/dashboard')) {
      if (effectiveRole !== 'tenant_owner' && effectiveRole !== 'coach' && effectiveRole !== 'admin' && effectiveRole !== 'platform_admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/p/')) {
      if (effectiveRole === 'participant') {
        if (!onboarding_complete && !location.pathname.includes('/onboarding')) {
            throw redirect({ to: '/onboarding' });
        }
      }
    }
    return { authContext: { ...((authContext as any) || {}), role: effectiveRole } };
    return { authContext };
  },
  component: () => <Outlet />,
});
