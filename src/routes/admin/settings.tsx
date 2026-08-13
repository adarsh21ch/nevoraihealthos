import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none font-serif italic">Platform Settings</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Configure global system parameters and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <SettingsCard 
          icon={Bell} 
          title="Notification Triggers" 
          description="Configure system-wide alerts for new enrollments and failures."
        />
        <SettingsCard 
          icon={SettingsIcon} 
          title="System Core" 
          description="Version control, maintenance mode, and debug logging levels."
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
