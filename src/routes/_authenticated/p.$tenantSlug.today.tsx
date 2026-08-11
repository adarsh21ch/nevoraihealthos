
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayData, toggleTaskCompletion, updateDailyLog, ProgramDayContent, DayTask } from '@/lib/today.functions';
import { CheckCircle2, Circle, Droplets, Info, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/today')({
  component: TodayPage,
});

function TodayPage() {
  const { tenantSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['today', tenantSlug],
    queryFn: () => getTodayData({ data: { tenantSlug } }),
  });

  useEffect(() => {
    if (data && 'redirect' in data && data.redirect) {
      navigate({ to: data.redirect as any });
    }
  }, [data, navigate]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your day...</div>;
  
  const state = data?.state;

  if (state === 'tenant_not_found') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tenant Not Found</h1>
        <p className="text-slate-500 mb-8">The link you followed is invalid or the distributor does not exist.</p>
        <Button asChild className="rounded-xl h-12 px-8">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  if (state === 'not_a_customer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal View</h1>
        <p className="text-slate-500 mb-8">
          You're signed in as an admin or owner. This is the customer portal for {data.tenant?.name || 'this tenant'}.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button asChild className="rounded-xl h-12 font-bold">
            <Link to="/admin">Go to Platform Admin</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-12 font-bold">
            <Link to="/dashboard">Go to Tenant Dashboard</Link>
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
          Your program is being prepared by your coach. Please check back shortly.
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          No program content found for today
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
          {data?.message || error?.message || "An unexpected error occurred while loading your data."}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['today'] })} className="rounded-xl h-12 px-8">
          Retry
        </Button>
      </div>
    );
  }

  if (!data || 'redirect' in data) return null;

  const { enrollment, dayContent, dailyLog, tenant } = data;
  const typedDayContent = dayContent as ProgramDayContent;
  const dayNumber = typedDayContent?.day_number || 0;
  const duration = enrollment.programs?.duration_days || 0;
  
  const totalTasks = typedDayContent?.tasks?.length || 0;
  const completedTasks = dailyLog?.task_completions?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await toggleTaskCompletion({
        data: {
          enrollmentId: enrollment.id,
          dayTaskId: taskId,
          logDate: data.todayStr,
          completed: !isCompleted,
          dayNumber: dayNumber
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleWaterClick = async () => {
    const currentWater = dailyLog?.water_ml || 0;
    const newWater = currentWater + 250;
    try {
      await updateDailyLog({
        data: {
          enrollmentId: enrollment.id,
          logDate: data.todayStr,
          dayNumber: dayNumber,
          water_ml: newWater
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
    } catch (err) {
      toast.error("Failed to update water");
    }
  };

  const handleMoodSelect = async (mood: string) => {
    try {
      await updateDailyLog({
        data: {
          enrollmentId: enrollment.id,
          logDate: data.todayStr,
          dayNumber: dayNumber,
          mood
        }
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
      toast.success(`Feeling ${mood}!`);
    } catch (err) {
      toast.error("Failed to update mood");
    }
  };

  if (dayNumber > duration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <Trophy className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Program Complete!</h1>
          <p className="text-slate-500 max-w-xs mx-auto">You've successfully finished the {enrollment.programs?.name} program. Time to celebrate!</p>
        </div>
        <Button asChild className="w-full h-14 bg-ink text-white font-bold rounded-xl active:scale-95 transition-all">
          <Link to={`/p/${tenantSlug}/complete` as any}>See my Results</Link>
        </Button>
      </div>
    );
  }

  if (dayNumber < 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Almost Ready!</h1>
        <p className="text-slate-500 mb-4">Your program starts on {new Date(enrollment.start_date).toLocaleDateString()}.</p>
      </div>
    );
  }

  const tasksBySlot = typedDayContent?.tasks?.reduce((acc: Record<string, DayTask[]>, task) => {
    const slot = task.time_slot || 'anytime';
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(task);
    return acc;
  }, {});

  const slotsOrder = ['morning', 'pre_lunch', 'lunch', 'evening', 'pre_dinner', 'dinner', 'bedtime', 'anytime'];

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500 space-y-8">
      {dayNumber >= duration - 2 && enrollment.programs?.next_program_code && (
        <Card className="rounded-[2rem] bg-ink text-white border-none shadow-xl overflow-hidden mb-8">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Next Program</p>
              <h2 className="text-xl font-black tracking-tight">Your program ends in {duration - dayNumber} days.</h2>
              <p className="text-white/70 text-sm font-medium">Start Day {dayNumber + 1} without a gap. Reorder now.</p>
            </div>
            <Button 
              asChild
              className="w-full h-12 bg-white text-ink font-black rounded-xl text-sm hover:bg-slate-100 transition-all active:scale-95"
            >
              <a href={`https://wa.me/${tenant.whatsapp?.replace(/\+/g, '')}?text=${encodeURIComponent(`Hi, I'm on Day ${dayNumber} of ${enrollment.programs.name}. I want to reorder for the next phase.`)}`} target="_blank">
                Contact {tenant.owner_name || 'Coach'} <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full accent-bg shadow-[0_0_8px_rgba(22,163,74,0.3)]"></div>
             <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
               {tenant.name}
             </h1>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">Day {dayNumber}</span>
            <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/ {duration}</span>
          </div>
        </div>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="#f1f5f9" strokeWidth="5"
            />
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="var(--accent, #16a34a)" strokeWidth="5"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[11px] font-bold text-slate-900">{progressPercent}%</span>
        </div>
      </div>

      {typedDayContent?.program_day?.motivation && (
        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 mb-12">
          <p className="text-slate-900 font-medium italic text-xl leading-relaxed">
            "{typedDayContent.program_day.motivation}"
          </p>
        </div>
      )}

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
                {slotTasks.map((task) => {
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

                      {task.product_image && (
                        <img 
                          src={task.product_image} 
                          alt={task.title}
                          className="w-12 h-12 object-cover rounded-2xl"
                          loading="lazy"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-slate-900 truncate leading-tight",
                          isCompleted && "text-slate-400 line-through decoration-1"
                        )}>
                          {task.title}
                        </h4>
                        {task.dosage && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {task.dosage}
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

      <div className="mt-16 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">Hydration</h3>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full uppercase tracking-widest">
            {(dailyLog?.water_ml || 0) / 1000}L / 2L
          </span>
        </div>
        <div className="flex gap-2 justify-between">
          {[...Array(8)].map((_, i) => {
            const isFilled = (dailyLog?.water_ml || 0) >= (i + 1) * 250;
            return (
              <button
                key={i}
                onClick={handleWaterClick}
                className={cn(
                  "w-10 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90",
                  isFilled ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white border border-slate-200 text-slate-200"
                )}
              >
                <Droplets className={cn("w-5 h-5", isFilled && "fill-current")} />
              </button>
            );
          })}
        </div>
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
                  ? "bg-ink border-ink text-white shadow-lg shadow-slate-900/10" 
                  : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {typedDayContent?.program_day?.meal_guidance && (
        <div className="mt-8 bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-100">
               <Info className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900">Meal Guidance</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
            {typedDayContent.program_day.meal_guidance}
          </p>
        </div>
      )}
    </div>
  );
}
