import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getDietPlan } from '@/lib/diet.functions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Info, Scale, Ruler, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
    enabled: !!customerMetrics,
    queryFn: () => dietPlanFn({ 
      data: { 
        age: customerMetrics!.age!, 
        height: Number(customerMetrics!.height_cm!), 
        weight: Number(customerMetrics!.weight_kg!), 
        gender: customerMetrics!.gender as any 
      } 
    })
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Calculating your personalized plan...</div>;

  if (!customerMetrics?.age) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Please complete your profile to see your diet plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-24 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Your Diet Plan</h1>
        <p className="text-slate-500 font-medium">Personalized for the C9 Program</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Scale className="w-5 h-5 text-slate-400" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</p>
              <p className="text-lg font-bold text-slate-900">{customerMetrics.weight_kg}kg</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Info className="w-5 h-5 text-slate-400" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target</p>
              <p className="text-lg font-bold text-slate-900">{plan?.targetCalories} kcal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] bg-ink text-white border-none shadow-xl overflow-hidden">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">C9 Nutritional Logic</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Your daily calorie target is <strong>{plan?.targetCalories} kcal</strong>. 
            This is optimized for fat loss while maintaining energy through high-quality Forever Living nutritional products.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Daily Schedule (Days 3-9)</h3>
        {plan?.days3to9.map((item: any) => (
          <div key={item.id} className="flex gap-4 group">
            <div className="w-1.5 h-auto rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors" />
            <div className="flex-1 pb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.slot.replace('_', ' ')}</p>
              <h4 className="font-bold text-slate-900">{item.name}</h4>
              <p className="text-sm text-slate-500 mt-1">{item.description}</p>
              {item.is_product && (
                <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter">
                  C9 Essential
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
          {plan?.notice}
        </p>
      </div>
    </div>
  );
}
