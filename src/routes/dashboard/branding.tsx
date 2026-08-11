import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Palette, Upload, Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getMyTenantAccessCode, rotateTenantAccessCode } from "@/lib/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/branding")({
  loader: async () => {
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const { data: tenant } = await supabase.from('tenants').select('id, name, tagline, logo_url, primary_color, whatsapp, custom_domain').eq('id', (authContext as any).tenant_id).single();
    return { tenant };
  },
  component: BrandingPage,
});

function BrandingPage() {
  const { tenant } = useLoaderData({ from: '/dashboard/branding' });
  const queryClient = useQueryClient();
  const fetchAccessCode = useServerFn(getMyTenantAccessCode);
  const rotateCodeFn = useServerFn(rotateTenantAccessCode);
  
  const { data: creds } = useQuery({
    queryKey: ["my-tenant-access-code"],
    queryFn: () => fetchAccessCode(),
  });

  const rotateMutation = useMutation({
    mutationFn: async () => {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return rotateCodeFn({ data: { tenantId: tenant?.id!, accessCode: newCode } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tenant-access-code"] });
      toast.success("Access code rotated successfully");
    },
    onError: (e: any) => toast.error(e.message)
  });

  const [formData, setFormData] = useState({
    name: tenant?.name || "",
    tagline: tenant?.tagline || "",
    primaryColor: tenant?.primary_color || "#000000",
    logoUrl: tenant?.logo_url || "",
    whatsapp: tenant?.whatsapp || "",
    customDomain: tenant?.custom_domain || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('tenants').update({
      name: formData.name,
      tagline: formData.tagline,
      primary_color: formData.primaryColor,
      logo_url: formData.logoUrl,
      whatsapp: formData.whatsapp,
      custom_domain: formData.customDomain
    } as any).eq('id', tenant?.id);

    if (error) toast.error(error.message);
    else toast.success("Branding updated");
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
      <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academy Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tagline</Label>
                <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Domain</Label>
                <div className="flex gap-2">
                  <Input value={formData.customDomain} onChange={e => setFormData({...formData, customDomain: e.target.value})} className="h-12 rounded-xl flex-1" placeholder="yourbrand.com" />
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => toast.info("DNS verification feature coming soon. Please contact support to verify your domain.")}>Verify</Button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold tracking-tight">Point your CNAME to <code className="text-slate-900">domains.nevorai.com</code></p>
              </div>
            </div>
            <div className="space-y-6 text-center">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-contain p-4" loading="lazy" alt="" /> : <Upload className="w-8 h-8 text-slate-300" />}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Color</Label>
                <div className="flex gap-4 items-center justify-center">
                  <Input type="color" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} className="w-12 h-12 p-1 rounded-xl" />
                  <code className="font-bold text-slate-900">{formData.primaryColor}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Access Security</h3>
                  <div className="text-3xl font-black tracking-tighter flex items-center gap-3">
                    {creds?.accessCode || "••••••"}
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20 font-bold uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-xs text-white/50 font-bold mt-1">Required for all new customer registrations.</p>
                </div>
              </div>
              <Button 
                onClick={() => rotateMutation.mutate()} 
                disabled={rotateMutation.isPending}
                className="h-12 px-6 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all shadow-lg active:scale-95"
              >
                {rotateMutation.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Rotate Code
              </Button>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />} Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
