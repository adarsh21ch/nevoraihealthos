import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Globe, Sparkles, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkAiStatus } from "@/lib/admin-settings.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandingSettings } from "@/components/admin/BrandingSettings";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const getAiStatusFn = useServerFn(checkAiStatus);
  const { data: aiStatus, isLoading } = useQuery({
    queryKey: ['admin-ai-status'],
    queryFn: () => getAiStatusFn({}),
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none font-serif italic">Platform Settings</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Configure global system parameters and application branding.</p>
      </div>

      <BrandingSettings />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Integration Card */}
        <Card className="border-slate-200 rounded-[2.5rem] shadow-sm bg-white overflow-hidden md:col-span-2">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  aiStatus?.enabled ? "bg-health-green/10 text-health-green" : "bg-amber-50 text-amber-500"
                )}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink">AI Coach Integration</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {isLoading ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checking status...</span>
                    ) : aiStatus?.enabled ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-health-green">
                        <CheckCircle2 className="w-3 h-3" /> Active: Google Gemini
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500">
                        <AlertCircle className="w-3 h-3" /> Key Missing
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl mb-6">
                Enable personalized AI Coach insights for all participants. This integration uses Google Gemini to analyze logs and provide real-time metabolic reset guidance.
              </p>
              
              {!aiStatus?.enabled && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
                  <Key className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-ink mb-1 uppercase tracking-tight">Configuration Required</p>
                    <p className="text-xs text-slate-500 leading-normal">
                      To activate AI coaching, please provide your <code className="bg-slate-200 px-1 rounded">GOOGLE_GEMINI_API_KEY</code> via the Lovable assistant or project secrets.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-center gap-4 min-w-[240px]">
              <Button 
                variant={aiStatus?.enabled ? "outline" : "default"} 
                className={cn("rounded-2xl w-full", !aiStatus?.enabled && "bg-health-green hover:bg-health-green/90")}
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              >
                {aiStatus?.enabled ? "Update Key" : "Get API Key"}
              </Button>
            </div>
          </div>
        </Card>

        <SettingsCard 
          icon={Shield} 
          title="Security & Auth" 
          description="Manage MFA requirements, session timeouts, and role permissions."
        />
        <SettingsCard 
          icon={Globe} 
          title="Global Localization" 
          description="Default currency, timezone handling, and supported languages."
        />
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description }: any) {
  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
          <Icon className="w-6 h-6 text-slate-400 group-hover:text-white" />
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <h3 className="text-xl font-bold text-ink mb-2">{title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
