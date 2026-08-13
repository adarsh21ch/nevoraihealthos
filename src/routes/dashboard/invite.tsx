import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Users, Copy, QrCode, MessageSquare, ArrowLeft, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAppSettings } from "@/lib/tenant.functions";

export const Route = createFileRoute("/dashboard/invite")({
  loader: async () => {
    return {};
  },
  component: InvitePage,
});

function InvitePage() {
  const getSettingsFn = useServerFn(getAppSettings);
  
  const { data: result } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => getSettingsFn(),
  });

  const settings = result?.settings;
  const brandName = settings?.brand_name || "Fat2Fit";
  
  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/p/fat2fit/join`
    : `/p/fat2fit/join`;
  
  const whatsappMsg = `Hi! Join ${brandName} here: ${joinUrl}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Invite Students</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Link & Access Code</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <div className="text-center space-y-1">
                <code className="text-xs font-bold text-slate-500 break-all px-4 block">/p/fat2fit/join</code>
                <div className="text-lg font-black text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block mt-2">
                  FAT2FIT
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Access Code</p>
              </div>
              <Button className="w-full bg-slate-900 text-white font-bold rounded-xl" onClick={() => { navigator.clipboard.writeText(`${joinUrl} (Code: FAT2FIT)`); toast.success("Link & Code copied"); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Invitation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Message</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
              <p className="text-sm font-medium text-slate-700 italic">"{whatsappMsg}"</p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`)}>
                <MessageSquare className="w-4 h-4 mr-2" /> Send on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}