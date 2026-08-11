import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // Verify role based on path
    const { data: authContext, error } = await supabase.rpc('get_my_auth_context');
    if (error || !authContext) {
      throw redirect({ to: '/login' });
    }

    const { role, tenant_slug, onboarding_complete } = authContext as any;

    if (location.pathname.startsWith('/admin')) {
      if (role !== 'platform_admin') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/dashboard')) {
      if (role !== 'tenant_owner') throw redirect({ to: '/login' });
    } else if (location.pathname.startsWith('/p/')) {
      // Customer path check: /p/:tenantSlug/*
      const pathSegments = location.pathname.split('/');
      const urlTenantSlug = pathSegments[2];
      
      if (role === 'customer') {
        if (urlTenantSlug !== tenant_slug) {
          throw redirect({ to: `/p/${tenant_slug}/today`, params: { tenantSlug: tenant_slug } } as any);
        }
        if (!onboarding_complete && !location.pathname.endsWith('/onboarding')) {
          throw redirect({ to: '/onboarding' });
        }
      } else if (role === 'tenant_owner') {
         if (urlTenantSlug !== tenant_slug) throw redirect({ to: '/dashboard' });
      } else if (role !== 'platform_admin') {
        throw redirect({ to: '/login' });
      }
    }
  },
  component: () => <Outlet />,
});
