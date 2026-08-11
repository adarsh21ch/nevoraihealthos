import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAtRiskList } from "@/lib/dashboard.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MessageSquare, ArrowRight, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/at-risk")({
  component: AtRiskPage,
});

function AtRiskPage() {
  const fetchAtRiskList = useServerFn(getAtRiskList);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["dashboard-at-risk-list"],
    queryFn: () => fetchAtRiskList(),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">At-Risk Athletes</h1>
          <p className="text-slate-500 mt-2 font-medium">Athletes who haven't logged in for 3 or more days.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
          ))
        ) : customers?.map((customer: any) => (
          <Card key={customer.id} className="bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow overflow-hidden group border-l-4 border-l-red-500">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                  <User className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{customer.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Last Logged: {customer.last_logged_at ? formatDistanceToNow(new Date(customer.last_logged_at), { addSuffix: true }) : "Never"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  className="flex-1 md:flex-none h-14 bg-slate-900 text-white font-bold rounded-2xl px-8 shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                  onClick={() => {
                    const msg = `Hi ${customer.name}! Noticed you haven't logged your progress in a few days. Everything okay? Let me know if you need any help!`;
                    window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
                  }}
                >
                  <MessageSquare className="mr-2 h-5 w-5" /> Check-in on WhatsApp
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white shadow-sm" asChild>
                   <Link to={`/dashboard/customers/${customer.id}` as any}>
                     <ArrowRight className="h-5 w-5" />
                   </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && customers?.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
            <Shield className="h-12 w-12 mb-4 text-emerald-500 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">All Athletes Active</p>
            <p className="text-sm mt-1">Great job! Everyone has logged recently.</p>
          </div>
        )}
      </div>
    </div>
  );
}
