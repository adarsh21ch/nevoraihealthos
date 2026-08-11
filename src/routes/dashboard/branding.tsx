import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Palette, Upload, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/branding")({
  loader: async () => {
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const { data: tenant } = await supabase.from('tenants').select('id, name, tagline, logo_url, primary_color, whatsapp').eq('id', (authContext as any).tenant_id).single();
    return { tenant };
  },
  component: BrandingPage,
});

function BrandingPage() {
  const { tenant } = useLoaderData({ from: '/dashboard/branding' });
  const [formData, setFormData] = useState({
    name: tenant?.name || "",
    tagline: tenant?.tagline || "",
    primaryColor: tenant?.primary_color || "#000000",
    logoUrl: tenant?.logo_url || "",
    whatsapp: tenant?.whatsapp || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('tenants').update({
      name: formData.name,
      tagline: formData.tagline,
      primary_color: formData.primaryColor,
      logo_url: formData.logoUrl,
      whatsapp: formData.whatsapp
    }).eq('id', tenant?.id);

    if (error) toast.error(error.message);
    else toast.success("Branding updated");
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Branding</h1>
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
            </div>
            <div className="space-y-6 text-center">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-contain p-4" alt="" /> : <Upload className="w-8 h-8 text-slate-300" />}
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
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />} Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
