
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
    <div className="min-h-screen bg-[#fcfbf8] pb-24">
      <main>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-[#16a34a]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "fill-[#16a34a]/10")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
