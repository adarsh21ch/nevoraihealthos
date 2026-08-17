import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Mail, Calendar, User, Activity, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export const getBmiLeads = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("bmi_leads")
    .select("id, name, email, bmi_value, bmi_category, goal, created_at, email_sent_at, report_text")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
});

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const fetchLeads = useServerFn(getBmiLeads);
  const { data: leads, isLoading } = useQuery({
    queryKey: ["bmi-leads"],
    queryFn: () => fetchLeads(),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-ink hover:shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-health-green"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead Generation</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">BMI Leads</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading leads...</div>
        ) : leads?.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No leads found yet.</div>
        ) : (
          leads?.map((lead: any) => (
            <Card key={lead.id} className="bg-white border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-ink">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ink">{lead.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
                        <Scale className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-ink">BMI {lead.bmi_value}</span>
                        <span className="text-[10px] font-bold text-slate-400">({lead.bmi_category})</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-ink">{lead.goal?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-ink">{format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Email Status</div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      lead.email_sent_at ? "bg-health-green/5 text-health-green border-health-green/20" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {lead.email_sent_at ? "Sent" : "Pending"}
                    </div>
                  </div>
                </div>

                {lead.report_text && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> AI Wellness Summary
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">{lead.report_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
