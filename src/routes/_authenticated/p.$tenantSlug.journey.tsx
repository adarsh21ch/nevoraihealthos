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
  
  // Real calculation of current day
  const getProgramDayNumber = (startDate: string) => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const tParts = today.split('-').map(Number);
    const sParts = startDate.slice(0, 10).split('-').map(Number);
    const diff = Date.UTC(tParts[0], tParts[1]-1, tParts[2]) - Date.UTC(sParts[0], sParts[1]-1, sParts[2]);
    return Math.floor(diff / 86400000) + 1;
  };
  
  const currentDay = customer?.start_date ? getProgramDayNumber(customer.start_date) : 1;

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="flex items-center gap-2 mb-4">
           <Trophy className="w-5 h-5 text-accent" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Program Map</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Your Journey</h1>
        <p className="text-slate-500 font-medium text-lg mt-3">{program?.name}</p>
      </header>

      <div className="relative space-y-8">
        <div className="absolute left-7 top-4 bottom-4 w-px bg-slate-100 -z-10" />

        {[...Array(duration)].map((_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isToday = dayNum === currentDay;
          const isFuture = dayNum > currentDay;
          
          const dayInfo = programDays?.find((d: any) => d.day_number === dayNum);
          
          return (
            <div key={dayNum} className="flex gap-8 items-center group">
              <div className={cn(
                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 z-10 transition-all duration-500",
                isToday ? "bg-white border-accent scale-110 shadow-xl shadow-purple-100" : 
                isPast ? "bg-accent border-accent text-white" : 
                "bg-slate-50 border-slate-100 text-slate-300"
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isFuture ? (
                  <Lock className="w-5 h-5 opacity-50" />
                ) : (
                  <span className="font-bold text-xl italic font-serif">{dayNum}</span>
                )}
              </div>

              <div className={cn(
                "flex-1 p-6 rounded-[2.5rem] border transition-all duration-500",
                isToday ? "bg-white border-slate-200 shadow-sm" :
                isPast ? "bg-slate-50/50 border-slate-100 opacity-60" :
                "bg-transparent border-transparent opacity-40"
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className={cn(
                      "font-bold text-lg leading-tight",
                      isFuture ? "text-slate-400" : "text-ink"
                    )}>
                      Day {dayNum}
                    </h3>
                    {dayInfo?.title && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{dayInfo.title}</span>
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
