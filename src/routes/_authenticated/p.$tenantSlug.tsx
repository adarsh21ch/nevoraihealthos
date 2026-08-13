import { createFileRoute, Outlet, useLoaderData, redirect } from '@tanstack/react-router';
import { Home, Calendar, Trophy, Package, User, MessageCircle } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-surface pb-24 font-sans" style={{ '--accent': primaryColor } as any}>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative">
            <div className="w-11 h-9 bg-ink rounded-lg rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xs tracking-tighter">F2F</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-md flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-ink uppercase tracking-tight">Fat<span className="text-health-green">2</span>Fit</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Protocol Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
             <a href={`https://wa.me/${tenant.whatsapp?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
               <MessageCircle className="w-5 h-5" />
             </a>
           </Button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-6 py-4 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all group",
                  isActive ? "accent-text" : "text-slate-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200 active:scale-90",
                  isActive ? "accent-bg-soft" : "group-hover:bg-slate-50"
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}