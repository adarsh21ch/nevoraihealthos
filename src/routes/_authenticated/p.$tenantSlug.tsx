import { createFileRoute, Outlet, useLoaderData, redirect } from '@tanstack/react-router';
import { Home, Calendar, Trophy, Package, User, MessageCircle } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug')({
  loader: async ({ params }) => {
    if (params.tenantSlug !== 'fat-to-fit' && params.tenantSlug !== 'fat2fit') {
      throw redirect({ to: '/p/fat2fit/today' as any });
    }
    const slug = params.tenantSlug;
    return {
      tenant: {
        id: 'fat-to-fit-id',
        name: 'Fat2Fit',
        slug,
        primary_color: '#7C3AED',
        tagline: '9-Day Reset Protocol',
        whatsapp: '+919876543210'
      }
    };
  },
  component: TenantLayout,
});

function TenantLayout() {
  const { tenant } = useLoaderData({ from: '/_authenticated/p/$tenantSlug' });
  const location = useLocation();

  const primaryColor = tenant.primary_color || '#064E3B';

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/${tenant.slug}/today` },
    { label: 'Journey', icon: Calendar, href: `/p/${tenant.slug}/journey` },
    { label: 'Diet', icon: Trophy, href: `/p/${tenant.slug}/diet` },
    { label: 'Kit', icon: Package, href: `/p/${tenant.slug}/kit` },
    { label: 'Profile', icon: User, href: `/p/${tenant.slug}/profile` },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans" style={{ '--accent': primaryColor } as any}>
      <ParticipantSidebar tenant={tenant} />
      
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile Header - only visible on mobile/tablet */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo />
          </div>
        </header>

        <main className="flex-1 w-full max-w-screen-xl mx-auto p-6 md:p-12">
          <Outlet />
        </main>

        <ParticipantBottomNav tenant={tenant} />
      </div>
    </div>
  );
}

import { ParticipantSidebar, ParticipantBottomNav } from '@/components/ParticipantNavigation';
