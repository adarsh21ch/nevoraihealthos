import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. Get the current hostname and tenant ID from metadata if possible
    // This allows dedicated domains like fat2fit.nevera.com to resolve correctly
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // Verify role based on path
    const { data: authContext, error } = await supabase.rpc('get_my_auth_context');
    if (error || !authContext) {
      return { authContext: null };
    }

    const { role, tenant_slug, onboarding_complete, tenant_id } = authContext as any;

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
