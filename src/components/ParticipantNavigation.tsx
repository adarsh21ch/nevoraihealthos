import { Home, Calendar, Trophy, Package, User, MessageCircle } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/ui/app-logo';

interface SidebarProps {
  tenant: {
    slug: string;
    whatsapp?: string;
  };
}

export function ParticipantSidebar({ tenant }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/${tenant.slug}/today` },
    { label: 'Journey', icon: Calendar, href: `/p/${tenant.slug}/journey` },
    { label: 'Diet', icon: Trophy, href: `/p/${tenant.slug}/diet` },
    { label: 'Kit', icon: Package, href: `/p/${tenant.slug}/kit` },
    { label: 'Profile', icon: User, href: `/p/${tenant.slug}/profile` },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50">
      <div className="p-8 pb-10">
        <AppLogo />
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);


          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-bold text-sm",
                isActive 
                  ? "bg-slate-900 text-white shadow-lg shadow-emerald-900/10 border-l-4 border-health-green" 
                  : "text-slate-400 hover:text-ink hover:bg-slate-50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="tracking-tight uppercase text-[11px] font-black tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-slate-50">
        <Button 
          variant="outline" 
          asChild 
          className="w-full h-12 rounded-2xl border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all gap-2 px-4 justify-start"
        >
          <a href={`https://wa.me/${tenant.whatsapp?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
          </a>
        </Button>
      </div>
    </aside>
  );
}

export function ParticipantBottomNav({ tenant }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/${tenant.slug}/today` },
    { label: 'Journey', icon: Calendar, href: `/p/${tenant.slug}/journey` },
    { label: 'Diet', icon: Trophy, href: `/p/${tenant.slug}/diet` },
    { label: 'Kit', icon: Package, href: `/p/${tenant.slug}/kit` },
    { label: 'Profile', icon: User, href: `/p/${tenant.slug}/profile` },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all group",
                isActive ? "text-health-green" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200 active:scale-90",
                isActive ? "bg-emerald-50" : "group-hover:bg-slate-50"
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
