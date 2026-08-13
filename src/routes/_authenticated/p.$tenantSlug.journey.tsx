import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getJourneyData } from '@/lib/journey.functions';
import { getCoachInsights } from '@/lib/ai/gemini.functions';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Trophy, Sparkles, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { getProgramDayNumber } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/journey')({
  component: JourneyPage,
});

function JourneyPage() {
  const { tenantSlug } = Route.useParams();
  const getJourneyFn = useServerFn(getJourneyData);
  const getInsightsFn = useServerFn(getCoachInsights);

  const { data, isLoading, error } = useQuery({
    queryKey: ['journey', tenantSlug],
    queryFn: () => getJourneyFn({}),
  });

  const { data: insights } = useQuery({
    queryKey: ['coach-insights', tenantSlug],
    queryFn: () => getInsightsFn({}),
    enabled: !!data && 'state' in data && data.state === 'success',
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-health-green/20 border-t-health-green rounded-full animate-spin"></div>
        <p className="text-slate-400 font-serif italic text-lg text-center">Mapping your path to health...</p>
      </div>
    );
  }

  if (error || (data && 'state' in data && data.state === 'error')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif italic font-bold text-ink">Journey Interrupted</h2>
          <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
            {data && 'message' in data ? data.message : "We couldn't synchronize your program timeline. Please try again."}
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl border-slate-200 px-8 py-6 h-auto font-bold text-ink shadow-sm hover:shadow-md transition-all">
          Retry Sync
        </Button>
      </div>
    );
  }

  if (!data || 'state' in data && data.state === 'no_content') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-serif italic font-bold text-ink">Your Story Begins Soon</h2>
          <p className="text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
            We're preparing your 9-day metabolic reset protocol. Check back once your enrollment is finalized.
          </p>
        </div>
      </div>
    );
  }

  const { customer, program, programDays } = data as any;
  const duration = (program?.duration_days as number) || 9;
  const currentDay = customer?.start_date ? getProgramDayNumber(customer.start_date) : 1;

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-32 animate-in fade-in duration-1000">
      {/* Editorial Header */}
      <header className="mb-12 relative">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-6 h-6 rounded-lg bg-health-green/10 flex items-center justify-center">
             <Trophy className="w-3.5 h-3.5 text-health-green" />
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phase One Map</span>
        </div>
        <h1 className="text-6xl font-bold text-ink tracking-tighter italic font-serif leading-none">Your Journey</h1>
        <div className="flex items-baseline gap-3 mt-4">
          <p className="text-slate-900 font-bold text-xl">{program?.name}</p>
          <div className="h-1 flex-1 bg-slate-50 rounded-full relative overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-health-green transition-all duration-1000" 
              style={{ width: `${Math.min(100, (currentDay / duration) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentDay}/{duration}</span>
        </div>
      </header>

      {/* AI Coach Milestone Insight */}
      {insights?.message && (
        <section className="bg-ink text-white rounded-[2.5rem] p-8 mb-12 relative overflow-hidden shadow-2xl shadow-ink/20">
          <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12">
            <Sparkles className="w-20 h-20 text-health-green" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-health-green" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-health-green">AI Coach Perspective</h4>
            </div>
            <p className="text-lg font-serif italic font-medium leading-relaxed text-slate-200">
              "{insights.message}"
            </p>
          </div>
        </section>
      )}

      {/* Timeline Interface */}
      <div className="relative space-y-4">
        {/* Connection Line */}
        <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-slate-50 -z-10" />

        {[...Array(duration)].map((_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isToday = dayNum === currentDay;
          const isFuture = dayNum > currentDay;
          const dayInfo = programDays?.find((d: any) => d.day_number === dayNum);
          
          return (
            <div key={dayNum} className={cn(
              "flex gap-6 items-start group transition-all duration-500",
              isPast && "opacity-50"
            )}>
              {/* Day Indicator Node */}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 z-10 transition-all duration-500 mt-2",
                isToday ? "bg-white border-health-green scale-110 shadow-2xl shadow-health-green/20" : 
                isPast ? "bg-health-green border-health-green text-white" : 
                "bg-slate-50 border-slate-100 text-slate-300 group-hover:border-slate-200"
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isFuture ? (
                  <Lock className="w-5 h-5 opacity-40" />
                ) : (
                  <span className="font-bold text-2xl italic font-serif text-ink">{dayNum}</span>
                )}
              </div>

              {/* Day Content Card */}
              <Link
                to={isFuture ? undefined : `/p/${tenantSlug}/today`}
                disabled={isFuture}
                className={cn(
                  "flex-1 p-6 rounded-[2.2rem] border transition-all duration-500 text-left relative overflow-hidden",
                  isToday ? "bg-white border-slate-100 shadow-md ring-1 ring-slate-100/50" :
                  isPast ? "bg-slate-50/50 border-transparent" :
                  "bg-transparent border-transparent"
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-bold text-xl tracking-tight leading-none",
                        isFuture ? "text-slate-400" : "text-ink"
                      )}>
                        Day {dayNum}
                      </h3>
                      {isToday && (
                        <span className="px-2 py-0.5 bg-health-green/10 text-health-green text-[9px] font-black uppercase tracking-widest rounded-full">Active</span>
                      )}
                    </div>
                    {dayInfo?.title ? (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{dayInfo.title}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Protocol details hidden</span>
                    )}
                  </div>
                  {!isFuture && (
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform duration-300 group-hover:translate-x-1",
                      isToday ? "text-health-green" : "text-slate-300"
                    )} />
                  )}
                </div>
                
                {isToday && dayInfo?.focus && (
                  <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 animate-in fade-in slide-in-from-top-1 duration-700">
                    {dayInfo.focus}
                  </p>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
