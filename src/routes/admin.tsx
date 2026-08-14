import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { ClientOnly } from '@/components/ui/client-only';
import { supabase } from '@/integrations/supabase/client';
import { resolveUserDestination } from '@/lib/auth-gate';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Users, Settings, LogOut, FileText, Database, Activity, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, Outlet } from '@tanstack/react-router';
import { AppLogo } from '@/components/ui/app-logo';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw redirect({ to: "/login" });
    
    const { role } = await resolveUserDestination(session.user);
    if (role !== "platform_admin" && role !== "admin") {
      throw redirect({ to: "/p/fat2fit/today" as any });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <ClientOnly>
      <div className="h-screen bg-slate-50 flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-8 space-y-10 flex flex-col h-full">
          <div className="flex items-center gap-4 px-2">
              <AppLogo variant="light" iconOnly />
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-tight">Fat2Fit</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Portal</span>
              </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              <NavItem icon={LayoutDashboard} label="Overview" to="/admin" />
              <NavItem icon={Users} label="Users" to="/admin/tenants/" />
              <NavItem icon={FileText} label="Content" to="/admin/content/" />
              <NavItem icon={Key} label="Access Codes" to="/admin/access-codes" />
              <NavItem icon={Settings} label="Settings" to="/admin/settings" />
          </nav>

          <div className="pt-8 mt-auto border-t border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start gap-3 px-4 h-12 rounded-xl transition-all"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) window.location.href = '/login';
              }}
            >
                <LogOut className="w-5 h-5" />
                <span className="font-bold text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-12 max-w-7xl mx-auto w-full space-y-12">
          <Outlet />
        </div>
      </main>
    </div>
    </ClientOnly>
  );
}


function NavItem({ icon: Icon, label, to }: any) {
    const isExact = to === '/admin';
    
    return (
        <Link 
          to={to}
          activeOptions={{ exact: isExact }}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm",
            "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
          activeProps={{ className: "bg-emerald-900 text-white shadow-lg shadow-black/20 border-l-4 border-emerald-500" }}
        >
            <Icon className="w-5 h-5" />
            {label}
        </Link>
    );
}
