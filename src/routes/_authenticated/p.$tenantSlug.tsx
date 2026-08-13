import { createFileRoute, Outlet, useLoaderData, redirect } from '@tanstack/react-router';
import { Home, Calendar, Trophy, Package, BookOpen, MessageCircle } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug')({
  loader: async ({ params }) => {
    if (params.tenantSlug !== 'fit-to-fit') {
      throw redirect({ to: '/p/fit-to-fit/today' as any });
    }
    return {
      tenant: {
        id: 'fit-to-fit-id',
        name: 'Fit to Fit',
        slug: 'fit-to-fit',
        primary_color: '#7C3AED',
        tagline: 'Your 9-day reset, guided day by day.',
        whatsapp: '+919876543210'
      }
    };
  },
  component: TenantLayout,
});

function TenantLayout() {
  const { tenant } = useLoaderData({ from: '/_authenticated/p/$tenantSlug' });
  const location = useLocation();

  const primaryColor = tenant.primary_color || '#7C3AED';

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/fit-to-fit/today` },
    { label: 'Journey', icon: Calendar, href: `/p/fit-to-fit/journey` },
    { label: 'Diet', icon: Trophy, href: `/p/fit-to-fit/diet` },
    { label: 'Kit', icon: Package, href: `/p/fit-to-fit/kit` },
    { label: 'Guide', icon: BookOpen, href: `/p/fit-to-fit/guide` },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans" style={{ '--accent': primaryColor } as any}>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-lg">
            F
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Fit to Fit</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Your 9-day reset</p>
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