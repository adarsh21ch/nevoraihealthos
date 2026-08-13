import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getDietPlan } from '@/lib/diet.functions';
import { supabase } from '@/integrations/supabase/client';
import { Apple, Info, Scale } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/diet')({
  component: DietPage,
});

function DietPage() {
  const { data: customerMetrics } = useQuery({
    queryKey: ['customer-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('age, height_cm, goal_weight_kg, gender')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const dietPlanFn = useServerFn(getDietPlan);
  const { data: plan, isLoading } = useQuery({
    queryKey: ['diet-plan', customerMetrics],
    enabled: !!customerMetrics && !!customerMetrics.age,
    queryFn: () => dietPlanFn({ 
      data: { 
        age: customerMetrics!.age!, 
        height: Number(customerMetrics!.height_cm!), 
        weight: Number(customerMetrics!.goal_weight_kg || 70), // Fallback
        gender: (customerMetrics!.gender as any) || 'female'
      } 
    })
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Calculating your personalized plan...</div>;

  if (!customerMetrics?.age) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Info className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium">Please complete your profile during onboarding to see your diet plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-24 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Fat2Fit Plan</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center gap-3 shadow-sm">
          <Scale className="w-5 h-5 text-slate-400" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Target</p>
            <p className="text-xl font-bold text-slate-900">{plan?.targetCalories} kcal</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Daily Schedule (Days 3-9)</h3>
        <div className="space-y-0">
          {plan?.days3to9.map((item: any, idx: number) => (
            <div key={item.id} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-slate-200 mt-1.5 group-hover:border-slate-900" />
                {idx !== plan.days3to9.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
              </div>
              <div className="flex-1 pb-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{item.slot.replace('_', ' ')}</p>
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}