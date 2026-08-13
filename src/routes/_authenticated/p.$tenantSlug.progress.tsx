import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Trophy, TrendingDown, Target, Zap } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/progress')({
  component: ProgressPage,
});

function ProgressPage() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('customers').select('id, name, start_date').eq('user_id', user.id).single();
      return data;
    }
  });

  const { data: measurements } = useQuery({
    queryKey: ['my-measurements', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('measurements')
        .select('day_number, weight_kg, waist_cm, hip_cm')
        .eq('customer_id', profile!.id)
        .order('day_number', { ascending: true });
      return data;
    }
  });

  const { data: logs } = useQuery({
    queryKey: ['my-logs-summary', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_logs')
        .select('log_date, water_glasses, mood, energy_level')
        .eq('customer_id', profile!.id)
        .order('log_date', { ascending: true });
      return data;
    }
  });

  const weightData = measurements?.map(m => ({
    name: `Day ${m.day_number}`,
    weight: m.weight_kg
  })) || [];

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-4">
           <Zap className="w-5 h-5 text-accent" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Performance</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Progress</h1>
      </header>

      {/* Weight Trend */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-bold text-ink flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-accent" />
            Weight Trend
        </h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#7C3AED" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent rounded-[2rem] p-6 text-white space-y-2">
            <Target className="w-5 h-5 opacity-70" />
            <div className="text-2xl font-bold italic font-serif">100%</div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-70">Adherence</div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-2">
            <Trophy className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold italic font-serif text-ink">9/9</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Days Active</div>
        </div>
      </div>
    </div>
  );
}
