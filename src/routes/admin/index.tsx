import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Activity, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTenants } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminPerformance,
});

function AdminPerformance() {
  const getTenantsFn = useServerFn(getTenants);
  const { data: tenants = [] } = useQuery({
    queryKey: ["admin-tenants-stats"],
    queryFn: () => getTenantsFn(),
  });

  const stats = [
    { title: "Total Tenants", value: tenants.length, icon: Building2, trend: "+12%" },
    { title: "Active Users", value: "1,284", icon: Users, trend: "+5.4%" },
    { title: "System Health", value: "99.9%", icon: Activity, trend: "Stable" },
    { title: "Revenue (MRR)", value: "$14,200", icon: TrendingUp, trend: "+18%" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Performance</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">System-wide overview of your platform's health and growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ink">{stat.value}</div>
              <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {tenants.slice(0, 5).map((tenant: any) => (
                 <div key={tenant.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                        {tenant.logo_url ? <img src={tenant.logo_url} className="w-full h-full object-contain p-1" loading="lazy" /> : tenant.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-none">{tenant.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">/p/{tenant.slug}</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</div>
                       <div className="text-xs font-bold text-slate-600 mt-0.5">{new Date(tenant.created_at).toLocaleDateString()}</div>
                    </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-slate-300" />
           </div>
           <div>
              <h3 className="font-bold text-lg text-slate-900">Growth Analytics</h3>
              <p className="text-slate-500 text-sm max-w-xs mt-1">Detailed growth charts and tenant retention metrics are being calculated.</p>
           </div>
           <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6">View Full Reports</Button>
        </Card>
      </div>
    </div>
  );
}
