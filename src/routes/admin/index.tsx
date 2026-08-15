import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCustomers } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminPerformance,
});

function AdminPerformance() {
  const getCustomersFn = useServerFn(getCustomers);
  const { data: customerResult } = useQuery({
    queryKey: ["admin-customers-stats"],
    queryFn: () => getCustomersFn({ data: { page: 0 } }),
  });

  const customersCount = customerResult?.total || 0;

  const stats = [
    { title: "Total Customers", value: customersCount, icon: Users, trend: "Live" },
    { title: "System Health", value: "99.9%", icon: Activity, trend: "Stable" },
    { title: "App Mode", value: "Dedicated", icon: TrendingUp, trend: "Fat2Fit" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Performance</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">System overview for Fat2Fit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 rounded-[2rem] shadow-sm">
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
    </div>
  );
}