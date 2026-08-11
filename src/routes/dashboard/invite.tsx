import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Users, Copy, QrCode, MessageSquare, ArrowLeft, RefreshCw, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyTenantAccessCode, rotateTenantAccessCode } from "@/lib/admin.functions";

export const Route = createFileRoute("/dashboard/invite")({
  loader: async () => {
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const ctx = authContext as { tenant_id?: string } | null;
    if (!ctx?.tenant_id) return { tenant: null };
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .eq('id', ctx.tenant_id)
      .maybeSingle();
    return { tenant };
  },
  component: InvitePage,
});

function InvitePage() {
  const { tenant } = useLoaderData({ from: '/dashboard/invite' });
  const queryClient = useQueryClient();
  const fetchAccessCode = useServerFn(getMyTenantAccessCode);
  const rotateCodeFn = useServerFn(rotateTenantAccessCode);
  
  const { data: creds, isLoading: loadingCode } = useQuery({
    queryKey: ["my-tenant-access-code"],
    queryFn: () => fetchAccessCode(),
    staleTime: 1000 * 60 * 5,
  });

  const rotateMutation = useMutation({
    mutationFn: async () => {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return rotateCodeFn({ data: { tenantId: (tenant as any)?.id, accessCode: newCode } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tenant-access-code"] });
      toast.success("Access code rotated successfully");
    },
    onError: (e: any) => toast.error(e.message)
  });
  const accessCode = creds?.accessCode ?? "…";
  // Use the specific tenant slug for the join link
  // If the hostname is a subdomain (e.g. fat2fit.nevera.com), the relative path /join will work
  const joinUrl = typeof window !== 'undefined' 
    ? (window.location.hostname.includes('.nevera.com') && !window.location.hostname.startsWith('project--'))
      ? `${window.location.origin}/join`
      : `${window.location.origin}/p/${tenant?.slug}/join`
    : `/p/${tenant?.slug}/join`;
  const whatsappMsg = `Hi! Join my wellness academy ${tenant?.name} here: ${joinUrl}. Use Access Code: ${accessCode}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Invite Customers</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Join Link</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <code className="text-xs font-bold text-slate-500 break-all text-center px-4">/p/{tenant?.slug}/join</code>
              <div className="flex w-full gap-2">
                <Button className="flex-1 bg-slate-900 text-white font-bold rounded-xl" onClick={() => { navigator.clipboard.writeText(joinUrl); toast.success("Link copied"); }}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Link
                </Button>
              </div>
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
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col gap-4 shadow-xl shadow-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Access Code</p>
                  <div className="text-3xl font-black tracking-tighter">{loadingCode ? "••••••" : accessCode}</div>
                </div>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => rotateMutation.mutate()}
                  disabled={rotateMutation.isPending}
                  className="h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <RefreshCw className={cn("w-4 h-4", rotateMutation.isPending && "animate-spin")} />
                </Button>
              </div>
              <p className="text-[10px] text-white/40 font-bold leading-tight">Customers must enter this code to register. You can rotate it anytime for security.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
