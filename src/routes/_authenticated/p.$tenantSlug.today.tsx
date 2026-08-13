import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayData, toggleTaskCompletion, updateDailyLog } from '@/lib/today.functions';
import { CheckCircle2, Droplets, Info, Calendar, Trophy, Moon, Sun, Smile, Frown, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServerFn } from '@tanstack/react-start';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['today', tenantSlug],
    queryFn: () => getTodayFn({}),
  });

  useEffect(() => {
    if (data && 'redirect' in data && data.redirect) {
      navigate({ to: data.redirect as any });
    }
  }, [data, navigate]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your day...</div>;
  if (!data || 'redirect' in data) return null;

  const state = data.state;
  if (state !== 'success') {
     // Handle error/no content states (omitted for brevity, assume plan logic)
     return <div className="p-8 text-center">{data.message || "Checking status..."}</div>;
  }

  const { customer, dayContent, dailyLog, dayNumber } = data as any;
  const totalTasks = dayContent?.tasks?.length || 0;
  const completedTasks = dailyLog?.task_completions?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    <div className="max-w-md mx-auto px-6 pt-12 pb-24 animate-in fade-in duration-500 space-y-10">
      {/* Header & Progress Ring */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">C9 Journey</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Day {dayNumber}</span>
          </div>
        </div>
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F5F9" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
              strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - progressPercent / 100)}
              strokeLinecap="round" className="text-accent transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-sm font-black text-ink">{progressPercent}%</span>
        </div>
      </div>

      {/* Hydration Tracker */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="font-bold text-ink">Hydration</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Goal: 8 glasses (2L)</p>
            </div>
            <span className="text-2xl font-bold text-accent italic font-serif">{dailyLog?.water_glasses || 0}/8</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => {
                const isActive = (dailyLog?.water_glasses || 0) > i;
                return (
                    <button 
                        key={i} 
                        onClick={() => updateWater(isActive ? i : i + 1)}
                        className={cn(
                            "h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                            isActive ? "bg-accent border-accent text-white" : "bg-slate-50 border-transparent text-slate-200"
                        )}
                    >
                        <Droplets className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
                    </button>
                );
            })}
        </div>
      </section>

      {/* Daily Checklist */}
      <div className="space-y-12">
        {slotsOrder.map(slot => {
          const slotTasks = tasksBySlot?.[slot];
          if (!slotTasks?.length) return null;

          return (
            <div key={slot} className="space-y-6">
              <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center px-4">
                    {slot.replace('_', ' ')}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <div className="space-y-4">
                {slotTasks.map((task: any) => {
                  const isCompleted = dailyLog?.task_completions?.some(
                    (c: any) => c.day_task_id === task.id
                  ) || false;
                  return (
                    <button 
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, isCompleted)}
                      className={cn(
                        "w-full flex items-center gap-5 p-6 rounded-[2.2rem] border transition-all duration-300 text-left",
                        isCompleted ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all border-2",
                        isCompleted ? "bg-accent border-accent text-white" : "bg-slate-50 border-slate-100 text-slate-200"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-ink leading-tight",
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

      {/* Mood & Energy */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div>
            <h3 className="font-bold text-ink mb-1 italic font-serif text-xl">Daily Check-in</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">How is your energy today?</p>
        </div>
        
        <div className="flex justify-between items-center gap-4">
            {[
                { label: 'Low', icon: Frown },
                { label: 'Steady', icon: Meh },
                { label: 'High', icon: Smile }
            ].map(mood => (
                <button
                    key={mood.label}
                    onClick={() => updateLogFn({ data: { customerId: customer.id, logDate: data.todayStr!, dayNumber, mood: mood.label }})}
                    className={cn(
                        "flex-1 flex flex-col items-center gap-3 py-6 rounded-3xl transition-all border-2",
                        dailyLog?.mood === mood.label ? "bg-accent border-accent text-white" : "bg-slate-50 border-transparent text-slate-400"
                    )}
                >
                    <mood.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{mood.label}</span>
                </button>
            ))}
        </div>
      </section>

      <footer className="py-12 px-6 text-center opacity-40">
        <div className="flex items-center justify-center gap-2 mb-2 group cursor-pointer">
          <div className="relative">
            <div className="w-8 h-7 bg-ink rounded-lg rotate-2 group-hover:rotate-6 transition-transform flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-[10px] tracking-tighter">F2F</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-sm flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
               <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
          <span className="text-xs font-black tracking-tighter text-ink uppercase">Fat<span className="text-accent">2</span>Fit</span>
        </div>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Build by Nevorai Technologies</p>
      </footer>
    </div>
  );
}
