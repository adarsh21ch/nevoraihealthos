import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { Users, TrendingUp, Package, BookOpen, Building2, QrCode, Copy, Share2, Palette, Shield, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { getDashboardStats } from "@/lib/dashboard.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const ctx = authContext as any;
    
    // Scoped queries to this tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, slug, name, owner_name, logo_url, tagline, primary_color')
      .eq('id', ctx.tenant_id)
      .single();

    return { tenant };
  },
  component: DashboardOverview,
});

function DashboardOverview() {
  const { tenant } = useLoaderData({ from: '/dashboard/' });
  const fetchStats = useServerFn(getDashboardStats);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
  });

  const statCards = [
    { title: "Active Customers", value: stats?.activeCustomers?.toString() || "...", icon: Users, color: "text-emerald-500", path: "/dashboard/customers" },
    { title: "Reorder Needed", value: stats?.reorder?.toString() || "...", icon: Package, color: "text-blue-500", path: "/dashboard/reorder" },
    { title: "At-risk (3+ days)", value: stats?.atRisk?.toString() || "...", icon: Shield, color: "text-red-500", path: "/dashboard/at-risk" },
    { title: "Completing This Week", value: stats?.completingThisWeek?.toString() || "0", icon: TrendingUp, color: "text-slate-500", path: "/dashboard/reorder" },
  ];

  const joinLink = `${window.location.origin}/p/${tenant?.slug}/join`;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Overview</h1>
          <p className="text-muted mt-4 font-medium text-lg max-w-md">Welcome back, {tenant?.owner_name}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.path as any}>
            <Card className="bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-8 pt-8">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-4xl font-bold text-ink tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Invite Card */}
        <Card className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Invite Customers</CardTitle>
            <Share2 className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Your Join Link</p>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <code className="text-xs font-bold text-ink break-all mr-2">/p/{tenant?.slug}/join</code>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { navigator.clipboard.writeText(joinLink); toast.success("Copied to clipboard"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="w-full bg-ink text-white font-bold rounded-xl h-11" asChild>
                    <Link to="/dashboard/invite">Manage Invitations</Link>
                  </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Brand Preview Card */}
        <Card className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Brand Identity</CardTitle>
            <Palette className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent className="p-8 flex items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
               {tenant?.logo_url ? (
                 <img src={tenant.logo_url} className="w-full h-full object-cover p-2" loading="lazy" alt="" />
               ) : (
                 <Building2 className="w-8 h-8 text-slate-200" />
               )}
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="font-bold text-ink">{tenant?.name}</h3>
                <p className="text-sm text-slate-500">{tenant?.tagline || 'No tagline set'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: tenant?.primary_color }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tenant?.primary_color}</span>
              </div>
              <Button variant="outline" className="rounded-xl h-9 text-xs font-bold px-4" asChild>
                <Link to="/dashboard/branding">Edit Branding</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}