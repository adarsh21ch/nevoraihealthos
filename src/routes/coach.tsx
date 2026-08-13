import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Activity, MessageCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/coach')({
  component: CoachDashboard,
});

function CoachDashboard() {
  const { data: participants, isLoading } = useQuery({
    queryKey: ['coach-participants'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from('customers')
        .select(`
          id, 
          name, 
          track,
          participant_programs (
            start_date,
            program:programs(name)
          )
        `)
        .order('name');
      return data || [];
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-10">
      <header className="flex justify-between items-end max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-4xl font-bold text-ink tracking-tight">Coach Portal</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoring active journeys</p>
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-10 w-64 bg-white border-slate-200 rounded-xl" placeholder="Search participants..." />
            </div>
            <Button className="bg-accent rounded-xl px-6">New Invite</Button>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
        {[
            { label: 'Active', value: participants?.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Attention', value: 0, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Completed', value: 0, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg. Adherence', value: '94%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                    <div className="text-3xl font-bold text-ink">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                </div>
            </div>
        ))}
      </section>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden max-w-6xl mx-auto w-full">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-ink text-lg">Active Participants</h3>
            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-slate-400">View All</Button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        <th className="px-8 py-6 font-black">Participant</th>
                        <th className="px-8 py-6 font-black">Program</th>
                        <th className="px-8 py-6 font-black">Day</th>
                        <th className="px-8 py-6 font-black">Adherence</th>
                        <th className="px-8 py-6 font-black">Status</th>
                        <th className="px-8 py-6 font-black text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {participants?.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase">
                                        {p.name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-ink">{p.name || 'Unnamed'}</div>
                                        <div className="text-xs text-slate-400">{p.track} Track</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-slate-600 font-medium">
                                {p.participant_programs?.[0]?.program?.name || 'C9 Reset'}
                            </td>
                            <td className="px-8 py-6 font-bold text-ink italic font-serif">
                                Day 1
                            </td>
                            <td className="px-8 py-6">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: '85%' }}></div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                                    Steady
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-accent">
                                        <MessageCircle className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-ink">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>
    </div>
  );
}

function Trophy(props: any) {
    return <Users {...props} />;
}
