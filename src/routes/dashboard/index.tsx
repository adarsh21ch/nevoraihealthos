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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Operational</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Platform control</h1>
          <p className="text-zinc-500 mt-2 font-light text-lg">Infrastructure signals across every tenant.</p>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900/30 px-3 py-1.5 rounded-lg border border-zinc-900/50">
          Snapshot: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900/20 border-zinc-900 hover:bg-zinc-900/40 transition-all duration-300 rounded-2xl group cursor-default">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stat.change.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-900/20 border-zinc-900 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-900/50 bg-zinc-900/10 px-6 py-4">
            <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Infrastructure Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-4 md:grid-cols-2">
            {['Database', 'WhatsApp API', 'Auth Service', 'Storage'].map(service => (
              <div key={service} className="flex justify-between items-center p-4 rounded-xl bg-black border border-zinc-900 hover:border-zinc-800 transition-colors group">
                <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">{service}</span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> stable
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/20 border-zinc-900 rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-zinc-900/50 bg-zinc-900/10 px-6 py-4">
            <CardTitle className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3 flex-1">
             <button className="w-full h-11 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors">Onboard Client</button>
             <button className="w-full h-11 bg-zinc-900 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 transition-colors border border-zinc-800">System Report</button>
             <div className="pt-4 mt-auto">
                <p className="text-[10px] text-zinc-600 font-medium text-center leading-relaxed">
                  Platform maintenance is scheduled for <br/>Sunday, 02:00 AM UTC
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
