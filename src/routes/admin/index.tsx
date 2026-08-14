import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getDashboardStats } from '@/lib/dashboard.functions';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, Database } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
});

function AdminOverview() {
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-6xl font-black text-ink tracking-tighter uppercase leading-none">
          Platform <span className="text-accent italic font-serif normal-case font-bold tracking-tight">Management</span>
        </h1>
        <p className="text-slate-500 font-medium mt-4 text-xl max-w-2xl">
          Global oversight and system configuration for the Fat2Fit ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
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
          <Button variant="outline" className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
            Download Audit Trail
          </Button>
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
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ink">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
