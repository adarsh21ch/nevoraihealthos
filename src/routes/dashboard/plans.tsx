import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ClipboardList, 
  User, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Edit,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/plans')({
  component: CoachPlansDashboard,
});

function CoachPlansDashboard() {
  const queryClient = useQueryClient();

  // 1. Get plans pending review for this coach's participants
  const { data: plans, isLoading } = useQuery({
    queryKey: ['coach-pending-plans'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const coachUserId = userData.user?.id;
      if (!coachUserId) return [];
      
      const { data: distributor } = await supabase
        .from('distributors')
        .select('id')
        .eq('user_id', coachUserId)
        .single();

      if (!distributor) return [];

      const { data: participants } = await supabase
        .from('customers')
        .select('user_id, name, track')
        .eq('distributor_id', distributor.id);

      if (!participants?.length) return [];

      const participantIds = participants
        .map(p => p.user_id)
        .filter((id): id is string => id !== null);

      const { data: nutritionPlans } = await supabase
        .from('nutrition_plans')
        .select('*, customer:customers!inner(name, track)')
        .in('participant_id', participantIds)
        .order('created_at', { ascending: false });

      return nutritionPlans || [];
    }
  });

  const publishPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('nutrition_plans')
        .update({ status: 'PUBLISHED', reviewed_at: new Date().toISOString() })
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-pending-plans'] });
      toast.success("Plan published to participant");
    }
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <div className="flex items-center gap-2 mb-2 text-emerald-600">
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Plan Oversight</span>
        </div>
        <h1 className="text-4xl font-bold text-ink tracking-tight font-serif">Nutrition Management</h1>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {plans?.map((plan: any) => (
            <Card key={plan.id} className="p-6 rounded-[2.5rem] border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-ink">{plan.customer?.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 rounded-md">
                      {plan.customer?.track}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      v{plan.version}
                    </span>
                    <span>•</span>
                    <span className={cn(
                      "flex items-center gap-1",
                      plan.status === 'PUBLISHED' ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                <Button variant="outline" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest">
                  <History className="w-3 h-3" />
                  View History
                </Button>
                <Button variant="outline" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Edit className="w-3 h-3" />
                  Edit Plan
                </Button>
                {plan.status !== 'PUBLISHED' && (
                  <Button 
                    className="rounded-full bg-ink text-white hover:bg-slate-800 gap-2 px-6 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => publishPlanMutation.mutate(plan.id)}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve & Publish
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {plans?.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
              <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No plans pending review</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
