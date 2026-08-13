import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, TrendingUp, Package, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/dashboard.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const fetchStats = useServerFn(getDashboardStats);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
  });

  const statCards = [
    { title: "Active Customers", value: stats?.activeCustomers?.toString() || "...", icon: Users, color: "text-emerald-500", path: "/dashboard/customers" },
    { title: "Reorder Needed", value: stats?.reorder?.toString() || "...", icon: Package, color: "text-blue-500", path: "/dashboard/reorder" },
    { title: "At-risk (3+ days)", value: stats?.atRisk?.toString() || "...", icon: Shield, color: "text-red-500", path: "/dashboard/at-risk" },
    { title: "Goal Completed", value: stats?.completingThisWeek?.toString() || "0", icon: TrendingUp, color: "text-slate-500", path: "/dashboard/customers" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Status</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Overview</h1>
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
    </div>
  );
}