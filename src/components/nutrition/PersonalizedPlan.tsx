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
  ChevronRight,
  AlertCircle,
  Activity,
  Droplets,
  Flame,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { getMyNutritionPlan, generateMyPersonalizedPlan, logMealStatus, getMealLogs } from "@/lib/nutrition/nutrition.functions";
import { validateProfileReadiness, getMyProfile } from "@/lib/profile/profile.functions";
import { getISTDateString } from "@/lib/date-utils";
import { toast } from "sonner";
import { Link, useParams } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

export function PersonalizedPlan() {
  const queryClient = useQueryClient();
  const { tenantSlug } = useParams({ from: '/_authenticated/p/$tenantSlug' });
  const today = getISTDateString();
  const getPlan = useServerFn(getMyNutritionPlan);
  const generatePlan = useServerFn(generateMyPersonalizedPlan);
  const logMutationFn = useServerFn(logMealStatus);
  const getLogs = useServerFn(getMealLogs);
  const checkReadiness = useServerFn(validateProfileReadiness);
  const getProfile = useServerFn(getMyProfile);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getProfile()
  });

  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['profile-readiness'],
    queryFn: () => checkReadiness()
  });

  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: ['my-nutrition-plan'],
    queryFn: () => getPlan(),
    enabled: !!readiness?.ready
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

  if (isReadinessLoading || (readiness?.ready && isPlanLoading)) {
    return (
      <div className="space-y-10 py-4">
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-[2.2rem]" />
          <Skeleton className="h-32 w-full rounded-[2.2rem]" />
          <Skeleton className="h-32 w-full rounded-[2.2rem]" />
        </div>
      </div>
    );
  }

  // 16. MY PLAN — PROFILE INCOMPLETE
  if (readiness && !readiness.ready) {
    return (
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 text-center space-y-8 shadow-sm animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 text-health-green rounded-[2rem] flex items-center justify-center mx-auto mb-4 relative">
          <Sparkles className="w-12 h-12" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
             <span className="text-[10px] font-black text-ink">{readiness.percent || 0}%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-3xl font-serif italic font-bold text-ink leading-tight">Your Personalized Plan is Almost Ready</h3>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Complete your profile so we can personalize your nutrition around your body, lifestyle and food preferences.
          </p>
        </div>
        
        <div className="bg-slate-50 rounded-3xl p-8 space-y-6 text-left border border-slate-100">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Completion</span>
              <span className="text-[11px] font-bold text-health-green bg-emerald-50 px-3 py-1 rounded-full">{readiness.percent || 0}%</span>
           </div>
           <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-health-green transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${readiness.percent || 0}%` }} />
           </div>
           
           <div className="space-y-4 pt-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2 block">Missing Information:</span>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {readiness.missing.slice(0, 6).map((m: any) => (
                 <div key={m.field} className="flex items-center gap-2.5 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold leading-none">{m.label}</span>
                 </div>
               ))}
               {readiness.missing.length > 6 && (
                 <div className="flex items-center justify-center p-3">
                    <span className="text-[10px] font-bold text-slate-400 italic">+{readiness.missing.length - 6} more details</span>
                 </div>
               )}
             </div>
           </div>
        </div>

        <Button 
          asChild
          className="w-full h-16 rounded-2xl bg-health-green hover:bg-health-green/90 text-white font-bold text-sm shadow-xl shadow-emerald-100 flex items-center justify-center transition-all duration-300"
        >
          <Link to="/p/$tenantSlug/profile" params={{ tenantSlug: tenantSlug as any }}>
            Complete Profile
          </Link>
        </Button>
      </div>
    );
  }
  
  // 17. MY PLAN — READY STATE
  if (!plan && !generateMutation.isPending) {
    return (
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 text-center space-y-8 shadow-sm animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 text-health-green rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-12 h-12" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-serif italic font-bold text-ink leading-tight">Your Plan is Ready to be Created</h3>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Your information is complete. Let's build your personalized 9-day metabolic reset nutrition plan.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => generateMutation.mutate()} 
            className="w-full h-16 rounded-2xl bg-health-green hover:bg-health-green/90 text-white font-bold text-sm shadow-xl shadow-emerald-100"
          >
            Create My Plan
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className="text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            <Link to="/p/$tenantSlug/profile" params={{ tenantSlug: tenantSlug as any }}>Review Health Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 18. MY PLAN — GENERATING STATE
  if (generateMutation.isPending) {
    return (
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center space-y-10 shadow-sm animate-in fade-in duration-700">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-4 border-emerald-50 rounded-[2.5rem] animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-t-health-green border-r-transparent border-b-transparent border-l-transparent rounded-[2.5rem] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-health-green" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-serif italic font-bold text-ink">Building Your Plan</h3>
          <p className="text-sm text-slate-500 max-w-[300px] mx-auto leading-relaxed font-medium">
            We're combining your profile, lifestyle, food preferences and approved Fat2Fit nutrition guidance.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={cn(
                "w-2 h-2 rounded-full bg-health-green animate-bounce",
                i === 1 && "delay-100",
                i === 2 && "delay-200"
              )} />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personalizing Indian meal options...</span>
        </div>
      </div>
    );
  }

  const planData = plan ? (plan.plan_data as any) : null;
  const customer = profile;

  if (!planData) return null;

  // 19. MY PLAN — GENERATED STATE
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* 20. FOOD PERSONALIZATION HIGHLIGHTS */}
      <section className="bg-emerald-900 text-white rounded-[2.5rem] p-8 space-y-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Flame className="w-24 h-24" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/60">Your Personalized Plan</span>
              <h2 className="text-3xl font-serif italic font-bold leading-tight">9-Day Metabolic Reset</h2>
            </div>
            <Target className="w-8 h-8 text-health-green" />
          </div>
          
          <p className="text-sm text-emerald-100/80 leading-relaxed italic font-serif">
            "{planData.plan_summary || "A balanced, nutrient-dense protocol tailored to your metabolic goals."}"
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-300 border border-white/10">Built for you</span>
            {customer?.diet_preference && (
              <span className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold text-white/70 border border-white/10">{customer.diet_preference}</span>
            )}
            {customer?.cooking_access && (
              <span className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold text-white/70 border border-white/10">{customer.cooking_access}</span>
            )}
            <span className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold text-white/70 border border-white/10">Indian foods focus</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300/50">Protein</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold">{planData.daily_targets?.protein_g || '--'}</span>
                <span className="text-[9px] font-bold text-emerald-300/50">g</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300/50">Calories</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold">{planData.daily_targets?.calories || '--'}</span>
                <span className="text-[9px] font-bold text-emerald-300/50">kcal</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300/50">Water</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold">{planData.daily_targets?.water_l || '2.0'}</span>
                <span className="text-[9px] font-bold text-emerald-300/50">L</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meals Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Daily Protocol</h3>
           <button 
             onClick={() => generateMutation.mutate()} 
             className="text-[10px] font-black uppercase tracking-widest text-health-green flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
           >
             <RefreshCw className={cn("w-3 h-3", generateMutation.isPending && "animate-spin")} />
             Regenerate
           </button>
        </div>

        <div className="space-y-6">
          {planData.meals?.map((meal: any, idx: number) => {
            const isCompleted = mealLogs?.some(l => l.meal_id === meal.id && l.status === 'COMPLETED');
            
            return (
              <div key={meal.id} className="relative group">
                {idx !== planData.meals.length - 1 && (
                  <div className="absolute left-[29px] top-16 bottom-0 w-px bg-slate-100 group-hover:bg-health-green/20 transition-colors" />
                )}
                
                <div className={cn(
                  "bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 relative z-10",
                  isCompleted ? "opacity-60 border-emerald-100 bg-emerald-50/20" : "hover:border-health-green/20 hover:shadow-md"
                )}>
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isCompleted ? "bg-health-green text-white shadow-lg shadow-emerald-900/10" : "bg-slate-50 text-slate-300 group-hover:text-health-green"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Utensils className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{meal.time}</span>
                        </div>
                        <h4 className="font-bold text-ink text-lg">{meal.name}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pl-1">
                    <div className="flex flex-wrap gap-2">
                      {meal.foods?.map((food: string) => (
                        <span key={food} className="px-3 py-1.5 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-100 group-hover:bg-white transition-colors">
                          {food}
                        </span>
                      ))}
                    </div>
                    
                    {meal.protein_content && (
                      <div className="flex items-center gap-1.5">
                         <Activity className="w-3.5 h-3.5 text-health-green" />
                         <span className="text-[10px] font-black text-health-green uppercase tracking-widest">
                            {meal.protein_content} Protein Focus
                         </span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {meal.portion_guidance}
                    </p>

                    <div className="flex gap-3 pt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isCompleted || logMutation.isPending}
                        onClick={() => logMutation.mutate({ mealId: meal.id, status: 'COMPLETED' })}
                        className={cn(
                          "h-12 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                          isCompleted ? "bg-health-green border-health-green text-white" : "border-slate-100 text-slate-500 hover:border-health-green hover:text-health-green"
                        )}
                      >
                        {isCompleted ? "Completed" : "Mark as Done"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-ink transition-colors"
                      >
                        Substitutions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 20. AI INSIGHTS & ADAPTATION */}
      <section className="bg-slate-50 rounded-[2.5rem] p-8 space-y-5 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <ChefHat className="w-20 h-20" />
        </div>
        <div className="flex items-center gap-3 text-ink relative z-10">
          <ChefHat className="w-6 h-6 text-health-green" />
          <h3 className="font-serif italic font-bold text-xl">Coach Insight</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">
          {planData.coach_notes || "Focus on hydration between meals and prioritize high-quality protein to support metabolic repair."}
        </p>
        <div className="pt-2 flex items-center justify-between relative z-10">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Sparkles className="w-3 h-3 text-health-green" />
             <span>Adapted for {planData.lifestyle_adaptation || 'your'} lifestyle</span>
           </div>
           <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </section>

      {/* Nutrition Assistant */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-ink">
            <MessageSquare className="w-6 h-6 text-health-green" />
            <h3 className="font-bold text-lg">Nutrition Assistant</h3>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">Ask about substitutions, travel tips, or office-friendly metabolic meals.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask your Fat2Fit Coach AI..."
            className="w-full h-16 pl-6 pr-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-health-green/10 text-sm font-medium"
          />
          <button className="absolute right-2 top-2 w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
