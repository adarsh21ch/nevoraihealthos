import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      // Don't redirect if we are already authenticated but context fails
      // Just let the route handle the "unauthorized" state or show a message
      return { authContext: null };
    }

    const { role, tenant_slug, onboarding_complete } = authContext as any;

    if (location.pathname.startsWith('/admin')) {
      if (role !== 'platform_admin') {
        toast.error("Access denied: Platform Admin only");
        throw redirect({ to: '/login' });
      }
    } else if (location.pathname.startsWith('/dashboard')) {
      if (role !== 'tenant_owner') {
        toast.error("Access denied: Tenant Owner only");
        throw redirect({ to: '/login' });
      }
    } else if (location.pathname.startsWith('/p/')) {
      const pathSegments = location.pathname.split('/');
      const urlTenantSlug = pathSegments[2];
      
      // Platform Admins can view any tenant portal for testing/management
      if (role === 'platform_admin') {
        return { authContext };
      }

      if (role === 'customer') {
        if (urlTenantSlug !== tenant_slug) {
          throw redirect({ to: `/p/${tenant_slug}/today` });
        }
        if (!onboarding_complete && !location.pathname.endsWith('/onboarding')) {
          throw redirect({ to: '/onboarding' });
        }
      } else if (role === 'tenant_owner') {
         if (urlTenantSlug !== tenant_slug) {
           toast.error("Access denied: Scoped to your own tenant");
           throw redirect({ to: '/dashboard' });
         }
      }
    }
    return { authContext };
  },
  component: () => <Outlet />,
});
