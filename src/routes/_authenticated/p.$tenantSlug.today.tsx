import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayData, toggleTaskCompletion, updateDailyLog } from '@/lib/today.functions';
import { getCoachInsights } from '@/lib/ai/gemini.functions';
import { 
  CheckCircle2, 
  Droplets, 
  Info, 
  Calendar, 
  Trophy, 
  Moon, 
  Sun, 
  Smile, 
  Frown, 
  Meh, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServerFn } from '@tanstack/react-start';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/today')({
  component: TodayPage,
});

function TodayPage() {
  const { tenantSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getTodayFn = useServerFn(getTodayData);
  const toggleTaskFn = useServerFn(toggleTaskCompletion);
  const updateLogFn = useServerFn(updateDailyLog);
  const getInsightsFn = useServerFn(getCoachInsights);

  const { data, isLoading, error } = useQuery({
    queryKey: ['today', tenantSlug],
    queryFn: () => getTodayFn({}),
  });

  const { data: insights } = useQuery({
    queryKey: ['coach-insights', tenantSlug],
    queryFn: () => getInsightsFn({}),
    enabled: !!data && 'state' in data && data.state === 'success',
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (data && 'redirect' in data && data.redirect) {
      console.log("Redirecting to:", data.redirect);
      navigate({ to: data.redirect as any });
    }
  }, [data, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-6 pt-12 pb-24 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-60 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <Info className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic font-bold text-ink">We couldn't complete that</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Something went wrong while loading your daily protocol.</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || 'redirect' in data) return null;

  const state = data.state;
  if (state !== 'success') {
    const isNoContent = state === 'no_content';
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          isNoContent ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
        )}>
          {isNoContent ? <Sparkles className="w-8 h-8" /> : <Calendar className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic font-bold text-ink">
            {isNoContent ? "Journey Pending" : `Day ${data.dayNumber || '...'} Protocol`}
          </h2>
          <p className="text-slate-500 max-w-xs mx-auto">
            {isNoContent 
              ? "Your enrollment is being processed. If you just completed onboarding, your protocol will appear here shortly." 
              : (data.message || "Checking status...")}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          {state === 'not_a_customer' && (
            <Button onClick={() => navigate({ to: '/onboarding' as any })} className="bg-health-green rounded-2xl text-white w-full">
              Start Onboarding
            </Button>
          )}
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] })} 
            variant="outline" 
            className="rounded-2xl w-full"
          >
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  const { customer, dayContent, dailyLog, dayNumber } = data as any;
  const totalTasks = dayContent?.tasks?.length || 0;
  const completedTasks = dailyLog?.task_completions?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Find primary focus task (first uncompleted task or first task)
  const primaryTask = dayContent?.tasks?.find((t: any) => 
    !dailyLog?.task_completions?.some((c: any) => c.day_task_id === t.id)
  ) || dayContent?.tasks?.[0];

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await toggleTaskFn({
        data: {
          customerId: customer.id,
          dayTaskId: taskId,
          logDate: data.todayStr!,
          completed: !isCompleted,
          dayNumber: dayNumber
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const updateWater = async (count: number) => {
    try {
      await updateLogFn({
        data: {
          customerId: customer.id,
          logDate: data.todayStr!,
          dayNumber: dayNumber,
          water_glasses: count
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
    } catch (err) {
      toast.error("Failed to update water");
    }
  };

  const tasksBySlot = dayContent?.tasks?.reduce((acc: Record<string, any[]>, task: any) => {
    const slot = task.slot || 'anytime';
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(task);
    return acc;
  }, {});

  const slotsOrder = ['morning', 'mid_morning', 'noon', 'early_evening', 'evening', 'all_day'];

  return (
    <div className="animate-in fade-in duration-500 space-y-8 md:space-y-12">
      {/* Header & Progress Ring */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-400 mb-1">Good morning, {customer?.name?.split(' ')[0] || 'there'}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-ink tracking-tight italic font-serif uppercase leading-none">Day {dayNumber} of 9</span>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-white p-4 pr-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#F1F5F9" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5"
                strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - progressPercent / 100)}
                strokeLinecap="round" className="text-health-green transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-black text-ink">{progressPercent}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Overall Progress</p>
            <p className="text-sm font-bold text-ink">{completedTasks} of {totalTasks} tasks complete</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-8 lg:space-y-12">
          {/* Today Hero Card */}
          <section className="bg-emerald-900 text-white rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-xl shadow-emerald-900/10">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-24 h-24 lg:w-32 lg:h-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300/60">Today's Focus</span>
                <h3 className="text-3xl lg:text-4xl font-serif italic font-bold leading-tight">Small actions. Consistent progress.</h3>
              </div>
              
              {primaryTask && (
                <div className="bg-white/10 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300/60 mb-1">Up Next</p>
                    <h4 className="font-bold text-base lg:text-lg">{primaryTask.title}</h4>
                  </div>
                  <Activity className="w-6 h-6 text-health-green" />
                </div>
              )}

              <Button 
                className="w-full h-16 bg-health-green hover:bg-health-green/90 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-950/20"
                onClick={() => {
                  const el = document.getElementById('tasks-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Today's Plan
              </Button>
            </div>
          </section>

          {/* AI Coach Insight */}
          {insights?.message && (
            <section className="bg-health-green/5 border border-health-green/10 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Sparkles className="w-16 h-16 text-health-green" />
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-health-green/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-health-green" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-health-green/60">Your Daily Insight</h4>
                  <p className="text-base lg:text-lg font-medium text-ink leading-relaxed font-serif italic">
                    "{insights.message}"
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Progress Snapshot */}
          {(customer?.weight_kg || customer?.target_weight_kg) && (
            <section className="bg-slate-50 rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 grid grid-cols-3 gap-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start</span>
                <p className="text-xl lg:text-2xl font-bold text-ink">{customer?.weight_kg || '--'}<span className="text-xs ml-0.5 opacity-50 uppercase font-sans">kg</span></p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-health-green">Current</span>
                <p className="text-xl lg:text-2xl font-bold text-ink">{dailyLog?.weight_kg || customer?.weight_kg || '--'}<span className="text-xs ml-0.5 opacity-50 uppercase font-sans">kg</span></p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target</span>
                <p className="text-xl lg:text-2xl font-bold text-ink">{customer?.target_weight_kg || '--'}<span className="text-xs ml-0.5 opacity-50 uppercase font-sans">kg</span></p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8 lg:space-y-12">
          {/* Hydration Tracker */}
          <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-ink italic font-serif text-2xl lg:text-3xl">Today's Hydration</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Goal: 8 glasses (2L)</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-health-green italic font-serif">{dailyLog?.water_glasses || 0}<span className="text-slate-200 mx-1">/</span>8</span>
                  <div className="w-24 h-1.5 bg-slate-50 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-health-green transition-all duration-500" 
                      style={{ width: `${Math.min(100, ((dailyLog?.water_glasses || 0) / 8) * 100)}%` }}
                    />
                  </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => {
                    const isActive = (dailyLog?.water_glasses || 0) > i;
                    return (
                        <button 
                            key={i} 
                            onClick={() => updateWater(isActive ? i : i + 1)}
                            className={cn(
                                "h-14 lg:h-16 rounded-2xl flex items-center justify-center transition-all border-2",
                                isActive ? "bg-health-green border-health-green text-white shadow-lg shadow-emerald-900/10" : "bg-slate-50 border-transparent text-slate-200 hover:border-slate-100"
                            )}
                        >
                            <Droplets className={cn("w-6 h-6", isActive ? "fill-current" : "")} />
                        </button>
                    );
                })}
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic text-center">Tap to log each glass of water</p>
          </section>

          {/* Daily Checklist (Right side on desktop) */}
          <div id="tasks-section" className="space-y-10 bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Daily Checklist</h3>

        
        {slotsOrder.map(slot => {
          const slotTasks = tasksBySlot?.[slot];
          if (!slotTasks?.length) return null;

          return (
            <div key={slot} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {slot.replace('_', ' ')}
                  </h4>
                  <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <div className="space-y-3">
                {slotTasks.map((task: any) => {
                  const isCompleted = dailyLog?.task_completions?.some(
                    (c: any) => c.day_task_id === task.id
                  ) || false;
                  return (
                    <button 
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, isCompleted)}
                      className={cn(
                        "w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 text-left",
                        isCompleted ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 shadow-sm hover:border-health-green/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all border-2",
                        isCompleted ? "bg-health-green border-health-green text-white" : "bg-slate-50 border-slate-100 text-slate-200"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-ink leading-tight text-sm",
                          isCompleted && "line-through text-slate-400"
                        )}>
                          {task.title}
                        </h4>
                        {task.detail && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {task.detail}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Mood & Energy */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white space-y-10 shadow-2xl shadow-slate-200">
        <div className="flex justify-between items-end">
          <div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-2 italic font-serif">Daily Check-in</h3>
              <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em]">How are you feeling today?</p>
          </div>
          <Smile className="w-10 h-10 text-health-green opacity-20" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 lg:gap-8">
            {[
                { label: 'Low', icon: Frown, color: 'text-orange-400' },
                { label: 'Steady', icon: Meh, color: 'text-blue-400' },
                { label: 'High', icon: Smile, color: 'text-health-green' }
            ].map(mood => (
                <button
                    key={mood.label}
                    onClick={() => updateLogFn({ data: { customerId: customer.id, logDate: data.todayStr!, dayNumber, mood: mood.label }})}
                    className={cn(
                        "flex flex-col items-center gap-4 py-8 rounded-[2rem] transition-all border-2",
                        dailyLog?.mood === mood.label ? "bg-health-green border-health-green text-white shadow-xl shadow-health-green/20" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    )}
                >
                    <mood.icon className={cn("w-8 h-8", dailyLog?.mood === mood.label ? "text-white" : mood.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                </button>
            ))}
        </div>
      </section>

      {/* Next Action Footer */}
      <section className="pt-8 flex justify-center">
        <Button 
          variant="ghost" 
          asChild
          className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-ink transition-colors"
        >
          <Link to={`/p/${tenantSlug}/journey` as any}>View Full Journey <ArrowRight className="ml-2 w-3 h-3" /></Link>
        </Button>
      </section>
    </div>
  );
}

