import { createFileRoute, Outlet, useLoaderData } from '@tanstack/react-router';
import { Home, Calendar, Trophy, Package, BookOpen, Loader2, MessageCircle } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug')({
  loader: async ({ params }) => {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, slug, logo_url, primary_color, tagline')
      .eq('slug', params.tenantSlug)
      .single();
    
    if (error || !tenant) {
      return { tenant: null, error: "Tenant not found" };
    }
    return { tenant };
  },
  component: TenantLayout,
});

function TenantLayout() {
  const { tenantSlug } = Route.useParams();
  const { tenant, error } = useLoaderData({ from: '/_authenticated/p/$tenantSlug' });
  const location = useLocation();

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Tenant Not Found</h1>
          <p className="text-slate-500">The distributor link you followed is invalid or has been moved.</p>
          <Link to="/" className="accent-text font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

// Removed is_active check since column is removed

  const primaryColor = tenant.primary_color || '#16a34a';

  const navItems = [
    { label: 'Today', icon: Home, href: `/p/${tenantSlug}/today` },
    { label: 'Journey', icon: Calendar, href: `/p/${tenantSlug}/journey` },
    { label: 'Progress', icon: Trophy, href: `/p/${tenantSlug}/progress` },
    { label: 'Kit', icon: Package, href: `/p/${tenantSlug}/kit` },
    { label: 'Guide', icon: BookOpen, href: `/p/${tenantSlug}/guide` },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans" style={{ '--accent': primaryColor } as any}>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} className="h-8 w-auto object-contain" loading="lazy" alt={tenant.name} />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              {tenant.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">{tenant.name}</h1>
            {tenant.tagline && <p className="text-[10px] text-slate-400 font-medium mt-1">{tenant.tagline}</p>}
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
                  "flex flex-col items-center gap-1.5 transition-all active:scale-90",
                  isActive ? "accent-text" : "text-slate-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-colors",
                  isActive && "accent-bg-soft"
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