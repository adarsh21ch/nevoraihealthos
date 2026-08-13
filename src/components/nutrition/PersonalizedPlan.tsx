import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Utensils, 
  ChefHat, 
  CheckCircle2, 
  RefreshCw, 
  MessageSquare,
  Sparkles,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { getMyNutritionPlan, generateMyPersonalizedPlan, logMealStatus, getMealLogs } from "@/lib/nutrition/nutrition.functions";
import { getISTDateString } from "@/lib/date-utils";
import { toast } from "sonner";

export function PersonalizedPlan() {
  const queryClient = useQueryClient();
  const today = getISTDateString();
  const getPlan = useServerFn(getMyNutritionPlan);
  const generatePlan = useServerFn(generateMyPersonalizedPlan);
  const logMutationFn = useServerFn(logMealStatus);
  const getLogs = useServerFn(getMealLogs);

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ['my-nutrition-plan'],
    queryFn: () => getPlan()
  });

  const { data: mealLogs } = useQuery({
    queryKey: ['meal-logs', today],
    queryFn: () => getLogs({ data: { date: today } } as any),
    enabled: !!plan
  });

  const generateMutation = useMutation({
    mutationFn: () => generatePlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-nutrition-plan'] });
      toast.success("New plan generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate plan");
    }
  });

  const logMutation = useMutation({
    mutationFn: (vars: { mealId: string, status: 'COMPLETED' | 'SKIPPED' | 'SUBSTITUTED' }) => 
      logMutationFn({
        data: {
          planId: plan!.id,
          mealId: vars.mealId,
          date: today,
          status: vars.status
        }
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs', today] });
      toast.success("Meal status updated!");
    }
  });

  if (isPlanLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-health-green animate-spin" />
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Designing your plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center p-8 bg-white border border-slate-100 rounded-[2.5rem] space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-health-green rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-ink italic font-serif">Personalize Your Path</h3>
          <p className="text-sm text-slate-500">We need a few details to craft your nutrition plan based on your metabolism and track.</p>
        </div>
        <div className="space-y-3">
          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="w-full h-14 rounded-2xl bg-health-green hover:bg-health-green-dark text-white font-black text-[10px] uppercase tracking-[0.2em]"
          >
            {generateMutation.isPending ? "Generating..." : "Generate My Plan"}
          </Button>
          <Button 
            variant="ghost"
            asChild
            className="w-full h-12 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400"
          >
            <a href="/onboarding">Update Health Profile</a>
          </Button>
        </div>
      </div>
    );
  }


  const planData = plan.plan_data as any;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Plan Hero */}
      <section className="bg-emerald-900 text-white rounded-[2.5rem] p-8 space-y-6 shadow-xl shadow-emerald-900/10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/60">Nutrition Summary</span>
            <h2 className="text-2xl font-serif italic font-bold leading-tight">Your 9-Day Metabolic Reset</h2>
          </div>
          <Target className="w-6 h-6 text-health-green" />
        </div>
        
        <p className="text-sm text-emerald-100/70 leading-relaxed italic">
          "{planData.plan_summary}"
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300/50">Protein Target</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{planData.daily_targets?.protein_g || '--'}</span>
              <span className="text-[10px] font-bold text-emerald-300/50">g</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300/50">Daily Energy</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{planData.daily_targets?.calories || '--'}</span>
              <span className="text-[10px] font-bold text-emerald-300/50">kcal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meals Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Today's Protocol</h3>
           <button 
             onClick={() => generateMutation.mutate()} 
             className="text-[10px] font-black uppercase tracking-widest text-health-green flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
           >
             <RefreshCw className={cn("w-3 h-3", generateMutation.isPending && "animate-spin")} />
             Regenerate
           </button>
        </div>

        <div className="space-y-4">
          {planData.meals?.map((meal: any, idx: number) => {
            const isCompleted = mealLogs?.some(l => l.meal_id === meal.id && l.status === 'COMPLETED');
            
            return (
              <div key={meal.id} className="relative">
                {idx !== planData.meals.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-px bg-slate-100" />
                )}
                
                <div className={cn(
                  "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300",
                  isCompleted ? "opacity-60 border-emerald-100 bg-emerald-50/20" : "hover:border-health-green/20"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        isCompleted ? "bg-health-green text-white" : "bg-slate-50 text-slate-400"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Utensils className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{meal.time}</span>
                          {meal.protein_content && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[8px] font-black text-health-green uppercase tracking-widest">
                              {meal.protein_content} Protein
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-ink">{meal.name}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pl-1">
                    <div className="flex flex-wrap gap-2">
                      {meal.foods?.map((food: string) => (
                        <span key={food} className="px-3 py-1.5 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100">
                          {food}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {meal.portion_guidance}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isCompleted || logMutation.isPending}
                        onClick={() => logMutation.mutate({ mealId: meal.id, status: 'COMPLETED' })}
                        className={cn(
                          "h-10 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          isCompleted ? "border-health-green text-health-green" : "border-slate-100 text-slate-600"
                        )}
                      >
                        {isCompleted ? "Completed" : "Mark Done"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ink"
                      >
                        Alternative
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Coach Notes */}
      <section className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4 border border-slate-100">
        <div className="flex items-center gap-3 text-ink">
          <ChefHat className="w-5 h-5" />
          <h3 className="font-bold">Coach Insight</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {planData.coach_notes}
        </p>
        <div className="pt-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Sparkles className="w-3 h-3 text-health-green" />
             <span>Adapted for {planData.lifestyle_adaptation || 'General'} lifestyle</span>
           </div>
        </div>
      </section>

      {/* Interactive AI Query */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-4">
        <div className="flex items-center gap-3 text-ink">
          <MessageSquare className="w-5 h-5 text-health-green" />
          <h3 className="font-bold">Nutrition Assistant</h3>
        </div>
        <p className="text-xs text-slate-400">Ask about substitutions, travel tips, or office-friendly meals.</p>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask your Fat2Fit Coach AI..."
            className="w-full h-14 pl-6 pr-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-health-green/20 text-sm"
          />
          <button className="absolute right-2 top-2 w-10 h-10 bg-health-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-health-green/20">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
