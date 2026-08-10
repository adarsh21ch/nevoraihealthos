
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getJourneyData } from '@/lib/journey.functions';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { getProgramDayNumber } from '@/lib/date-utils';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/journey')({
  component: JourneyPage,
});

function JourneyPage() {
  const { tenantSlug } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['journey', tenantSlug],
    queryFn: () => getJourneyData({ data: { tenantSlug } }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your journey...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading journey</div>;
  if (!data) return null;

  const { enrollment, programDays, completions } = data;
  const currentDay = getProgramDayNumber(enrollment.start_date);
  const duration = enrollment.programs?.duration_days || 0;

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Journey</h1>
        <p className="text-slate-500 font-medium">{enrollment.programs?.name}</p>
      </header>

      <div className="relative space-y-8">
        {/* The vertical line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-200 -z-10" />

        {[...Array(duration)].map((_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isToday = dayNum === currentDay;
          const isFuture = dayNum > currentDay;
          
          const dayInfo = programDays.find(d => d.day_number === dayNum);
          
          // Completion stats for this day
          const dayTasks = dayInfo?.day_tasks || [];
          const dayCompletions = completions.filter(c => 
            c.daily_logs.day_number === dayNum
          );
          
          const completionRate = dayTasks.length > 0 
            ? Math.round((dayCompletions.length / dayTasks.length) * 100) 
            : 0;

          return (
            <div key={dayNum} className="flex gap-6 items-start">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 z-10 transition-all shadow-sm",
                isToday ? "bg-white border-[#16a34a] scale-110" : 
                isPast ? "bg-[#16a34a] border-[#16a34a] text-white" : 
                "bg-slate-100 border-slate-100 text-slate-400"
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isFuture ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span className="font-bold text-lg text-[#16a34a]">{dayNum}</span>
                )}
              </div>

              <div className={cn(
                "flex-1 p-6 rounded-3xl border transition-all",
                isToday ? "bg-white border-[#16a34a]/20 shadow-lg shadow-[#16a34a]/5" :
                isPast ? "bg-white border-slate-100 opacity-80" :
                "bg-slate-50/50 border-transparent opacity-60"
              )}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className={cn(
                    "font-bold text-lg",
                    isFuture ? "text-slate-400" : "text-slate-900"
                  )}>
                    Day {dayNum}
                    {dayInfo?.title && <span className="ml-2 font-medium text-slate-500">— {dayInfo.title}</span>}
                  </h3>
                  {isPast && completionRate > 0 && (
                    <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded-full">
                      {completionRate}%
                    </span>
                  )}
                </div>
                
                {isToday && (
                  <p className="text-sm text-[#16a34a] font-bold mt-2">Active now</p>
                )}
                
                {isFuture && (
                  <p className="text-xs text-slate-400 font-medium mt-1 italic">Locked until day {dayNum}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
