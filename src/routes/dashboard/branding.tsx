import { createFileRoute, useLoaderData, useNavigate, Link } from "@tanstack/react-router";
import { Upload, Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getAppSettings } from "@/lib/tenant.functions";
import { updateAppSettings } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/branding")({
  loader: async () => {
    return {};
  },
  component: BrandingPage,
});

function BrandingPage() {
  const navigate = useNavigate();
  const getSettingsFn = useServerFn(getAppSettings);
  const updateSettingsFn = useServerFn(updateAppSettings);
  
  const { data: result } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => getSettingsFn(),
  });

  const settings = result?.settings;

  const [formData, setFormData] = useState({
    name: settings?.brand_name || "Fat2Fit",
    tagline: settings?.tagline || "",
    whatsapp: settings?.whatsapp_number || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsFn({
        data: {
          brand_name: formData.name,
          tagline: formData.tagline,
          whatsapp_number: formData.whatsapp,
          health_disclaimer: settings?.health_disclaimer || "",
          results_disclaimer: settings?.results_disclaimer || ""
        }
      });
      toast.success("Settings updated");
    } catch (error: any) {
      toast.error(error.message);
    }
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
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand Name</Label>
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
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />} Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}