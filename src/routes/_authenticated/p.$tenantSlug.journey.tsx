import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getJourneyData } from '@/lib/journey.functions';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Trophy } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/journey')({
  component: JourneyPage,
});

function JourneyPage() {
  const { tenantSlug } = Route.useParams();
  const getJourneyFn = useServerFn(getJourneyData);

  const { data, isLoading, error } = useQuery({
    queryKey: ['journey', tenantSlug],
    queryFn: () => getJourneyFn(),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your journey...</div>;
  if (error || data?.state !== 'success') return <div className="p-8 text-center text-red-500">Error loading journey: {data?.message || 'Unknown error'}</div>;

  const { customer, program, programDays, completions } = data as any;
  const duration = program?.duration_days || 9;
  const currentDay = 1; // Simplification for now

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
           <Trophy className="w-4 h-4 text-slate-400" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Program Map</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Your Journey</h1>
        <p className="text-slate-500 font-medium text-lg mt-2">{program?.name}</p>
      </header>

      <div className="relative space-y-6">
        <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100 -z-10" />

        {[...Array(duration)].map((_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isToday = dayNum === currentDay;
          const isFuture = dayNum > currentDay;
          
          const dayInfo = programDays?.find((d: any) => d.day_number === dayNum);
          
          return (
            <div key={dayNum} className="flex gap-6 items-center">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 z-10 transition-all",
                isToday ? "bg-white border-accent scale-110 shadow-lg" : 
                isPast ? "bg-accent border-accent text-white" : 
                "bg-slate-50 border-slate-100 text-slate-300"
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isFuture ? (
                  <Lock className="w-4 h-4 opacity-50" />
                ) : (
                  <span className="font-bold text-lg">{dayNum}</span>
                )}
              </div>

              <div className={cn(
                "flex-1 p-5 rounded-[2rem] border transition-all",
                isToday ? "bg-white border-slate-200 shadow-sm" :
                isPast ? "bg-slate-50/50 border-slate-100 opacity-60" :
                "bg-transparent border-transparent opacity-40"
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className={cn(
                      "font-bold text-base leading-none",
                      isFuture ? "text-slate-400" : "text-slate-900"
                    )}>
                      Day {dayNum}
                    </h3>
                    {dayInfo?.title && (
                      <span className="text-xs font-medium text-slate-500 mt-1">{dayInfo.title}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}