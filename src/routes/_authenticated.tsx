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

    if (location.pathname.startsWith('/admin')) {
      if (role !== 'admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/dashboard')) {
      if (role !== 'distributor' && role !== 'admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/p/')) {
      if (role === 'customer' && !onboarding_complete && !location.pathname.endsWith('/onboarding')) {
        throw redirect({ to: '/onboarding' });
      }
    }
    return { authContext };
  },
  component: () => <Outlet />,
});
