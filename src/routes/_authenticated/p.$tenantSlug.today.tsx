
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getTodayData, toggleTaskCompletion, updateDailyLog } from '@/lib/today.functions';
import { CheckCircle2, Circle, Droplets, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/today')({
  component: TodayPage,
});

function TodayPage() {
  const { tenantSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getToday = useServerFn(getTodayData);
  const toggleTask = useServerFn(toggleTaskCompletion);
  const updateLog = useServerFn(updateDailyLog);

  const { data, isLoading, error } = useQuery({
    queryKey: ['today', tenantSlug],
    queryFn: () => getToday({ tenantSlug }),
  });

  // Handle redirects
  useEffect(() => {
    if (data?.redirect) {
      navigate({ to: data.redirect });
    }
  }, [data, navigate]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your day...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading data</div>;
  if (data?.redirect || !data) return null;

  const { enrollment, dayContent, dailyLog, tenant } = data;
  const dayNumber = dayContent?.day_number || 0;
  const duration = enrollment.programs?.duration_days || 0;
  
  // Progress calculation
  const totalTasks = dayContent?.tasks?.length || 0;
  const completedTasks = dailyLog?.task_completions?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await toggleTask({
        enrollmentId: enrollment.id,
        dayTaskId: taskId,
        logDate: data.todayStr,
        completed: !isCompleted
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
      await updateLog({
        enrollmentId: enrollment.id,
        logDate: data.todayStr,
        water_ml: newWater
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
    } catch (err) {
      toast.error("Failed to update water");
    }
  };

  const handleMoodSelect = async (mood: string) => {
    try {
      await updateLog({
        enrollmentId: enrollment.id,
        logDate: data.todayStr,
        mood
      });
      queryClient.invalidateQueries({ queryKey: ['today', tenantSlug] });
      toast.success(`Feeling ${mood}!`);
    } catch (err) {
      toast.error("Failed to update mood");
    }
  };

  if (dayNumber > duration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Congratulations!</h1>
        <p className="text-slate-500 mb-8">You've successfully completed the {enrollment.programs?.name} program.</p>
        <Link to={`/p/${tenantSlug}/journey`} className="text-green-600 font-bold underline">Review your Journey</Link>
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

  // Group tasks by slot
  const tasksBySlot = dayContent?.tasks?.reduce((acc: any, task: any) => {
    const slot = task.time_slot || 'anytime';
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(task);
    return acc;
  }, {});

  const slotsOrder = ['morning', 'pre_lunch', 'lunch', 'evening', 'pre_dinner', 'dinner', 'bedtime', 'anytime'];

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">
            {tenant.name}
          </h1>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">Day {dayNumber}</span>
            <span className="text-slate-400 font-medium">of {duration}</span>
          </div>
        </div>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="#f1f5f9" strokeWidth="6"
            />
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="#16a34a" strokeWidth="6"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-900">{progressPercent}%</span>
        </div>
      </div>

      {dayContent?.program_day?.motivation && (
        <div className="bg-[#16a34a]/5 border border-[#16a34a]/10 rounded-3xl p-6 mb-10">
          <p className="text-[#16a34a] italic text-lg leading-relaxed">
            "{dayContent.program_day.motivation}"
          </p>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-10">
        {slotsOrder.map(slot => {
          const slotTasks = tasksBySlot?.[slot];
          if (!slotTasks?.length) return null;

          return (
            <div key={slot} className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {slot.replace('_', ' ')}
              </h3>
              <div className="space-y-3">
                {slotTasks.map((task: any) => {
                  const isCompleted = dailyLog?.task_completions?.some(
                    (c: any) => c.day_task_id === task.id
                  );
                  return (
                    <div 
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-3xl border transition-all duration-200",
                        isCompleted ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200 shadow-sm"
                      )}
                    >
                      <button 
                        onClick={() => handleToggleTask(task.id, isCompleted)}
                        className="flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-8 h-8 text-[#16a34a] fill-[#16a34a]/10" />
                        ) : (
                          <Circle className="w-8 h-8 text-slate-200" />
                        )}
                      </button>

                      {task.product_image && (
                        <img 
                          src={task.product_image} 
                          alt={task.title}
                          className="w-10 h-10 object-cover rounded-xl"
                          loading="lazy"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-slate-900 truncate",
                          isCompleted && "text-slate-400 line-through decoration-1"
                        )}>
                          {task.title}
                        </h4>
                        {task.dosage && (
                          <p className="text-xs text-slate-500 font-medium">
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

      {/* Water Tracker */}
      <div className="mt-12 bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-900">Hydration</h3>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
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
                  "w-8 h-10 rounded-lg flex items-center justify-center transition-all",
                  isFilled ? "bg-blue-500 text-white" : "bg-white border border-blue-100 text-blue-200"
                )}
              >
                <Droplets className="w-4 h-4 fill-current" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mt-6 bg-slate-50 rounded-3xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-4">How are you feeling?</h3>
        <div className="flex gap-3">
          {['Great', 'OK', 'Tough'].map(mood => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className={cn(
                "flex-1 py-3 rounded-2xl font-bold text-sm transition-all border",
                dailyLog?.mood === mood 
                  ? "bg-white border-slate-200 shadow-sm text-slate-900" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Guidance */}
      {dayContent?.program_day?.meal_guidance && (
        <div className="mt-6 bg-amber-50/50 rounded-3xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">Meal Guidance</h3>
          </div>
          <p className="text-sm text-amber-900/70 leading-relaxed font-medium">
            {dayContent.program_day.meal_guidance}
          </p>
        </div>
      )}
    </div>
  );
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
