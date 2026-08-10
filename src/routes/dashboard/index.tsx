import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingUp, Package, BookOpen, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const stats = [
    { title: "Active Customers", value: "128", change: "+12%", icon: Users, color: "text-green-500" },
    { title: "Adherence Rate", value: "92%", change: "High", icon: TrendingUp, color: "text-blue-500" },
    { title: "Reorders", value: "14", change: "3 Due", icon: Package, color: "text-orange-500" },
    { title: "Active Program", value: "Clean 9 Express", change: "Active", icon: BookOpen, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform control</h1>
        <p className="text-slate-400 mt-1">Everything at a glance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300">Infrastructure Health</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {['Database', 'WhatsApp API', 'Auth Service', 'Storage'].map(service => (
             <div key={service} className="flex justify-between items-center p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors">
                <span className="text-sm text-slate-300">{service}</span>
                <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/> Stable</span>
             </div>
           ))}
        </CardContent>
      </Card>
    </div>
  );
}
