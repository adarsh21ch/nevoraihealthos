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
    if (!authContext) {
      return { authContext: null };
    }

    const { role, onboarding_complete } = authContext as any;

    // Gating logic based on Premium Fat2Fit roles
    if (location.pathname.startsWith('/admin')) {
      if (role !== 'platform_admin' && role !== 'admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/coach') || location.pathname.startsWith('/dashboard')) {
      if (role !== 'tenant_owner' && role !== 'coach' && role !== 'admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/p/')) {
      if (role === 'participant') {
        if (!onboarding_complete && !location.pathname.includes('/onboarding')) {
            throw redirect({ to: '/onboarding' });
        }
      }
    }
    return { authContext };
  },
  component: () => <Outlet />,
});
