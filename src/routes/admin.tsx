import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ClientOnly } from '@/components/ui/client-only';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Users, Settings, LogOut, FileText, Database, Activity, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServerFn } from '@tanstack/react-start';
import { getDashboardStats } from '@/lib/dashboard.functions';
import { Link, Outlet } from '@tanstack/react-router';
import { AppLogo } from '@/components/ui/app-logo';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw redirect({ to: "/login" });
    
    // Recovery check: platform admins skip the RPC lookup if needed
    if (user.email === 'teamnevorai@gmail.com') return;

    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "platform_admin") {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const getStatsFn = useServerFn(getDashboardStats);
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getStatsFn(),
  });

  const stats = [
    { label: 'Total Users', value: statsData?.activeCustomers ?? '...', icon: Users },
    { label: 'At Risk', value: statsData?.atRisk ?? '...', icon: Activity },
    { label: 'System Health', value: 'Good', icon: Database },
  ];

  return (
    <ClientOnly>
      <div className="h-screen bg-slate-50 flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-8 space-y-10 flex flex-col h-full">
          <div className="flex items-center gap-4 px-2">
              <AppLogo variant="light" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Admin Portal</span>
              </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              <NavItem icon={LayoutDashboard} label="Overview" to="/admin" />
              <NavItem icon={Users} label="Users" to="/admin/tenants" />
              <NavItem icon={FileText} label="Content" to="/admin/content" />
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
          {/* We only show the overview stats on the index route of admin */}
          <RouteContent stats={stats} />
          <Outlet />
        </div>
      </main>
    </div>
    </ClientOnly>
  );
}

}



function RouteContent({ stats }: { stats: any[] }) {
  const isOverview = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
  
  if (!isOverview) return null;


  return (
    <>
      <header>
          <h1 className="text-6xl font-black text-ink tracking-tighter uppercase leading-none">Platform <span className="text-accent italic font-serif normal-case font-bold tracking-tight">Management</span></h1>
          <p className="text-slate-500 font-medium mt-4 text-xl max-w-2xl">Global oversight and system configuration for the Fat2Fit ecosystem.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(stat => (
              <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50/50 pb-2 p-8 border-b border-slate-100">
                      <div className="flex justify-between items-center">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <stat.icon className="w-5 h-5 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Metric</span>
                      </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-6">
                      <div className="text-5xl font-bold text-ink italic font-serif leading-none">{stat.value}</div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-3">{stat.label}</div>
                  </CardContent>
              </Card>
          ))}
      </div>

      <section className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10">
          <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-2xl tracking-tight">System Logs</h3>
                  <p className="text-slate-400 text-sm font-medium">Real-time platform activity</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">Download Audit Trail</Button>
          </div>
          <div className="space-y-4">
              {[
                { event: "New Program Invocation", user: "User ID #429", time: "10 mins ago" },
                { event: "Access Code Generated", user: "Admin", time: "2 hours ago" },
                { event: "Tenant Config Updated", user: "System", time: "5 hours ago" }
              ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-6 items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <div>
                              <div className="text-sm font-black text-ink uppercase tracking-wide">{log.event}</div>
                              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{log.time} • {log.user}</div>
                          </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ink">View Details</Button>
                  </div>
              ))}
          </div>
      </section>
    </>
  );
}

function NavItem({ icon: Icon, label, to }: any) {
    return (
        <Link 
          to={to}
          activeOptions={{ exact: true }}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm",
            "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
          activeProps={{ className: "bg-accent text-white shadow-lg shadow-purple-900/20" }}
        >

            <Icon className="w-5 h-5" />
            {label}
        </Link>
    );
}
