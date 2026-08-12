import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getDietPlan } from '@/lib/diet.functions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Apple, Info, Scale, Ruler, User } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/diet')({
  component: DietPage,
});

function DietPage() {
  const { tenantSlug } = Route.useParams();

  const { data: customerMetrics } = useQuery({
    queryKey: ['customer-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('age, height_cm, weight_kg, gender')
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
        weight: Number(customerMetrics!.weight_kg!), 
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
        <p className="text-slate-500 font-medium">Personalized for the C9 Program</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center gap-3 shadow-sm">
          <Scale className="w-5 h-5 text-slate-400" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Weight</p>
            <p className="text-xl font-bold text-slate-900">{customerMetrics.weight_kg}kg</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center gap-3 shadow-sm">
          <Info className="w-5 h-5 text-slate-400" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Target</p>
            <p className="text-xl font-bold text-slate-900">{plan?.targetCalories} kcal</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-ink text-white border-none shadow-xl overflow-hidden">
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">C9 Nutritional Logic</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed font-medium">
            Your daily calorie target is <span className="text-white font-bold">{plan?.targetCalories} kcal</span>. 
            This is optimized for fat loss while maintaining energy through high-quality Forever Living products.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Daily Schedule (Days 3-9)</h3>
        <div className="space-y-0">
          {plan?.days3to9.map((item: any, idx: number) => (
            <div key={item.id} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-slate-200 mt-1.5 group-hover:border-ink transition-colors" />
                {idx !== plan.days3to9.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
              </div>
              <div className="flex-1 pb-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{item.slot.replace('_', ' ')}</p>
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{item.description}</p>
                {item.is_product && (
                  <div className="inline-flex items-center px-3 py-1 mt-4 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-widest">
                    C9 Essential
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-amber-900/70 leading-relaxed italic">
          {plan?.notice}
        </p>
      </div>
    </div>
  );
}
