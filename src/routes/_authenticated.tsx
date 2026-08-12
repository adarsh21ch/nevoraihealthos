import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    // 1. Resolve tenant from hostname or context
    const tenant = (context as any).tenant;
    const isCustomDomain = (context as any).isCustomDomain;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If we're on a custom domain, redirect to their branded join page
      if (tenant && isCustomDomain) {
        throw redirect({ to: `/p/${tenant.slug}/join` as any });
      }

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
        throw redirect({ to: '/login' });
      }
    } else if (location.pathname.startsWith('/dashboard')) {
      if (role !== 'tenant_owner') {
        throw redirect({ to: '/login' });
      }
    } else if (location.pathname.startsWith('/p/') || (isCustomDomain && tenant)) {
      const pathSegments = location.pathname.split('/');
      const urlTenantSlug = pathSegments[2] || tenant?.slug;
      
      // Platform Admins can view any tenant portal for testing/management
      if (role === 'platform_admin') {
        return { authContext };
      }

      if (role === 'customer') {
        if (urlTenantSlug !== tenant_slug) {
          // If the customer tries to access a different tenant portal, redirect them back to their own
          toast.error(`Access denied: You are enrolled in ${tenant_slug}`);
          throw redirect({ to: `/p/${tenant_slug}/today` as any });
        }
        if (!onboarding_complete && !location.pathname.endsWith('/onboarding')) {
          throw redirect({ to: '/onboarding' });
        }
      } else if (role === 'tenant_owner') {
         if (urlTenantSlug !== tenant_slug) {
           // Allow owners to see their own tenant portal
           toast.error("Access denied: Scoped to your own website");
           throw redirect({ to: '/dashboard' });
         }
      }
    }
    return { authContext };
  },
  component: () => <Outlet />,
});
