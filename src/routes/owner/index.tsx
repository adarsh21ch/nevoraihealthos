import { createFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Key, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/owner/')({
  component: OwnerOverview,
});

function OwnerOverview() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-ink leading-none font-serif italic">Dashboard</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Welcome to your coaching control center.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard 
          title="Active Participants" 
          value="--" 
          icon={Users}
          description="Total enrolled students"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard 
          title="Access Codes" 
          value="--" 
          icon={Key}
          description="Available for new signups"
          color="bg-purple-50 text-purple-600"
        />
        <StatsCard 
          title="Engagement" 
          value="--" 
          icon={TrendingUp}
          description="Average task completion"
          color="bg-blue-50 text-blue-600"
        />
      </div>

      <Card className="border-slate-200 rounded-[2rem] shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="max-w-xl space-y-6">
            <h3 className="text-2xl font-bold text-ink">Ready to onboard new participants?</h3>
            <p className="text-slate-500 leading-relaxed">
              Generate unique access codes to invite your clients to the program. 
              Each code allows one person to create an account and join your coaching group.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description, color }: any) {
  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ink">{value}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';
