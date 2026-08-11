
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Home, Calendar, Trophy, Package, BookOpen } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug')({
  component: TenantLayout,
});

function TenantLayout() {
  const { tenantSlug } = Route.useParams();
  const location = useLocation();

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/${tenantSlug}/today` },
    { label: 'Journey', icon: Calendar, href: `/p/${tenantSlug}/journey` },
    { label: 'Progress', icon: Trophy, href: `/p/${tenantSlug}/progress` },
    { label: 'Kit', icon: Package, href: `/p/${tenantSlug}/kit` },
    { label: 'Guide', icon: BookOpen, href: `/p/${tenantSlug}/guide` },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] pb-24 font-sans">
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
                  "flex flex-col items-center gap-1.5 transition-all active:scale-90",
                  isActive ? "text-[#16a34a]" : "text-slate-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-colors",
                  isActive && "bg-[#16a34a]/10"
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
