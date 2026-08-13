import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayData, toggleTaskCompletion, updateDailyLog } from '@/lib/today.functions';
import { CheckCircle2, Droplets, Info, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle } from 'lucide-react';
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
    queryFn: () => getTodayFn({ data: { tenantSlug } }),
  });

  useEffect(() => {
    if (data && 'redirect' in data && data.redirect) {
      navigate({ to: data.redirect as any });
    }
  }, [data, navigate]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your day...</div>;
  
  if (!data || 'redirect' in data) return null;

  const state = data.state;

  if (state === 'not_a_customer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal View</h1>
        <p className="text-slate-500 mb-8">
          You're signed in as an admin or coach.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button asChild className="rounded-xl h-12 font-bold">
            <Link to="/admin">Go to Platform Admin</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-12 font-bold">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'no_content') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Program Setting Up</h1>
        <p className="text-slate-500 mb-4">
          Your program is being prepared. Please check back shortly.
        </p>
      </div>
    );
  }

  if (state === 'error' || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-4">
          {data.message || error?.message || "An unexpected error occurred."}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] })} className="rounded-xl h-12 px-8">
          Retry
        </Button>
      </div>
    );
  }

  const { customer, dayContent, dailyLog } = data as any;
  const dayNumber = dayContent?.day_number || 0;
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

  const handleMoodSelect = async (mood: string) => {
    try {
      await updateLogFn({
        data: {
          customerId: customer.id,
          logDate: data.todayStr!,
          dayNumber: dayNumber,
          note: `Feeling ${mood}`
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
      toast.success(`Feeling ${mood}!`);
    } catch (err) {
      toast.error("Failed to update mood");
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
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500 space-y-8">
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">Day {dayNumber}</span>
          </div>
        </div>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="var(--accent, #16a34a)" strokeWidth="5"
              strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - progressPercent / 100)}
              strokeLinecap="round" className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[11px] font-bold text-slate-900">{progressPercent}%</span>
        </div>
      </div>

      <div className="space-y-12">
        {slotsOrder.map(slot => {
          const slotTasks = tasksBySlot?.[slot];
          if (!slotTasks?.length) return null;

          return (
            <div key={slot} className="space-y-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">
                {slot.replace('_', ' ')}
              </h3>
              <div className="space-y-3">
                {slotTasks.map((task: any) => {
                  const isCompleted = dailyLog?.task_completions?.some(
                    (c: any) => c.day_task_id === task.id
                  ) || false;
                  return (
                    <div 
                      key={task.id}
                      className={cn(
                        "flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-300",
                        isCompleted ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200 shadow-sm"
                      )}
                    >
                      <button 
                        onClick={() => handleToggleTask(task.id, isCompleted)}
                        className="flex-shrink-0 transition-transform active:scale-90"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-9 h-9 accent-text" />
                        ) : (
                          <div className="w-9 h-9 rounded-full border-2 border-slate-100 flex items-center justify-center">
                             <div className="w-4 h-4 rounded-full bg-slate-50"></div>
                          </div>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-slate-900 truncate leading-tight",
                          isCompleted && "text-slate-400 line-through"
                        )}>
                          {task.title}
                        </h4>
                        {task.detail && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {task.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6">How are you feeling?</h3>
        <div className="flex gap-3">
          {['Great', 'OK', 'Tough'].map(mood => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className={cn(
                "flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border",
                dailyLog?.mood === mood 
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                  : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}