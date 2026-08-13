import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReorderList } from "@/lib/dashboard.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MessageSquare, ArrowRight, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/reorder")({
  component: ReorderPage,
});

function ReorderPage() {
  const fetchReorderList = useServerFn(getReorderList);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["dashboard-reorder-list"],
    queryFn: () => fetchReorderList(),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reorder List</h1>
        <p className="text-slate-500 mt-2 font-medium">Athletes nearing the end of their program.</p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
          ))
        ) : (customers as any[]).map((customer: any) => (
          <Card key={customer.id} className="bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{customer.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{customer.program_name}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Day {customer.day_number} of {customer.duration_days}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button 
                  className="flex-1 md:flex-none h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-8 shadow-lg active:scale-95 transition-all"
                  onClick={() => {
                    const msg = `Hi ${customer.name}! You're on Day ${customer.day_number} of ${customer.program_name}. It's time to reorder!`;
                    window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
                  }}
                >
                  <MessageSquare className="mr-2 h-5 w-5" /> WhatsApp
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm" asChild>
                   <Link to={`/dashboard/customers/${customer.id}` as any}>
                     <ArrowRight className="h-5 w-5" />
                   </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && (customers as any[]).length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
            <Package className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Clear for today</p>
          </div>
        )}
      </div>
    </div>
  );
}