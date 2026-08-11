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
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Infrastructure Active</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-none">Dashboard</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Health OS signals across managed client tenants.</p>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white border-slate-100 hover:border-slate-200 transition-all duration-300 rounded-[2rem] group cursor-default shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-8 pt-8">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-900" />
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  stat.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid gap-4 md:grid-cols-2">
            {['Global Database', 'WhatsApp API', 'Auth Gateway', 'Asset Storage'].map(service => (
              <div key={service} className="flex justify-between items-center p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors group">
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900">{service}</span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> online
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-8 py-6">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4 flex-1">
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Upcoming Window</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  Sunday, 02:00 AM UTC <br/>
                  Duration: 15 mins
                </p>
             </div>
             <button className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
               View Logs
             </button>
             <button className="w-full h-12 bg-white text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100">
               Audit Assets
             </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
