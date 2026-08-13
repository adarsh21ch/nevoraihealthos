import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getJourneyData } from '@/lib/journey.functions';
import { getCoachInsights } from '@/lib/ai/gemini.functions';
import { cn } from '@/lib/utils';
import { CheckCircle2, Lock, Trophy, Sparkles, ChevronRight, Info, AlertCircle, Calendar } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { getProgramDayNumber } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/journey')({
  component: JourneyPage,
});

function JourneyPage() {
  const { tenantSlug } = Route.useParams();
  const queryClient = useQueryClient();
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
      <div className="max-w-md mx-auto px-6 pt-16 pb-32 space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-[2.5rem]" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-6 items-start">
              <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
              <Skeleton className="h-24 flex-1 rounded-[2.2rem]" />
            </div>
          ))}
        </div>
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
            {data && 'message' in data ? data.message : "We couldn't synchronize your program timeline."}
          </p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['journey', tenantSlug] })} variant="outline" className="rounded-2xl border-slate-200 px-8 py-6 h-auto font-bold text-ink shadow-sm hover:shadow-md transition-all">
          Retry Sync
        </Button>
      </div>
    );
  }

  if (!data || (data && 'state' in data && data.state === 'no_content')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-inner">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-serif italic font-bold text-ink">Protocol in Preparation</h2>
          <p className="text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
            We're setting up your metabolic reset schedule. This usually happens immediately after enrollment is finalized.
          </p>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['journey', tenantSlug] })} 
          variant="outline" 
          className="rounded-2xl px-8"
        >
          Check Enrollment Status
        </Button>
      </div>
    );
  }

  const { customer, program, programDays } = data as any;
  const duration = (program?.duration_days as number) || 9;
  const currentDay = customer?.start_date ? getProgramDayNumber(customer.start_date) : 1;

  return (
    <div className="w-full animate-in fade-in duration-1000 max-w-6xl mx-auto lg:px-8">
      {/* Editorial Header */}
      <header className="mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-xl bg-health-green/10 flex items-center justify-center">
                 <Trophy className="w-4 h-4 text-health-green" />
               </div>
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Day {currentDay} of {duration}</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-ink tracking-tighter italic font-serif leading-none">Your Journey</h1>
          </div>
          
          <div className="flex flex-col gap-6 md:w-full md:max-w-md">
            <p className="text-slate-500 font-medium text-lg italic">"You're building consistency, one day at a time."</p>
            <div className="space-y-3">
              <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-health-green shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (currentDay / duration) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-[11px] font-black text-ink uppercase tracking-widest">{Math.round((currentDay / duration) * 100)}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* AI Coach Milestone Insight */}
      {insights?.message && (
        <section className="bg-emerald-900 text-white rounded-[2.5rem] p-8 lg:p-12 mb-16 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-20 rotate-12">
            <Sparkles className="w-24 h-24 lg:w-32 lg:h-32 text-health-green" />
          </div>
          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-health-green" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-health-green">AI Coach Perspective</h4>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic font-medium leading-tight text-emerald-50">
              "{insights.message}"
            </p>
          </div>
        </section>
      )}

      {/* Timeline Interface */}
      <div className="relative space-y-8 lg:space-y-12">
        {/* Connection Line */}
        <div className="absolute left-[27.5px] lg:left-[39.5px] top-10 bottom-10 w-0.5 bg-slate-100 -z-10" />

        {[...Array(duration)].map((_, i) => {
          const dayNum = i + 1;
          const isPast = dayNum < currentDay;
          const isToday = dayNum === currentDay;
          const isFuture = dayNum > currentDay;
          const dayInfo = programDays?.find((d: any) => d.day_number === dayNum);
          
          return (
            <div key={dayNum} className={cn(
              "flex gap-6 lg:gap-10 items-start group transition-all duration-500",
              isPast && "opacity-50"
            )}>
              {/* Day Indicator Node */}
              <div className={cn(
                "w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex items-center justify-center shrink-0 border-2 z-10 transition-all duration-500 mt-2",
                isToday ? "bg-white border-health-green scale-110 shadow-2xl shadow-health-green/20" : 
                isPast ? "bg-health-green border-health-green text-white" : 
                "bg-slate-50 border-slate-100 text-slate-300 group-hover:border-slate-200"
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-7 h-7 lg:w-10 lg:h-10" />
                ) : isFuture ? (
                  <Lock className="w-5 h-5 lg:w-7 lg:h-7 opacity-40" />
                ) : (
                  <span className="font-bold text-2xl lg:text-4xl italic font-serif text-ink">{dayNum}</span>
                )}
              </div>

              {/* Day Content Card */}
              <Link
                to={isFuture ? "/p/$tenantSlug/journey" : "/p/$tenantSlug/today"}
                params={{ tenantSlug }}
                disabled={isFuture}
                className={cn(
                  "flex-1 p-6 lg:p-10 rounded-[2.2rem] lg:rounded-[3rem] border transition-all duration-500 text-left relative overflow-hidden",
                  isToday ? "bg-white border-slate-100 shadow-md ring-1 ring-slate-100/50" :
                  isPast ? "bg-slate-50/50 border-transparent" :
                  "bg-transparent border-transparent"
                )}
              >
                <div className="flex justify-between items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className={cn(
                        "font-bold text-xl lg:text-3xl tracking-tight leading-none",
                        isFuture ? "text-slate-400" : "text-ink"
                      )}>
                        Day {dayNum}
                      </h3>
                      {isToday && (
                        <span className="px-3 py-1 bg-health-green/10 text-health-green text-[10px] font-black uppercase tracking-widest rounded-full">Active Now</span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-black text-health-green uppercase tracking-widest">Completed</span>
                      )}
                    </div>
                    {dayInfo?.title ? (
                      <span className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{dayInfo.title}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Protocol Locked</span>
                    )}
                  </div>
                  {!isFuture && (
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform duration-300 group-hover:translate-x-1",
                      isToday ? "text-health-green" : "text-slate-300"
                    )} />
                  )}
                </div>
                
                {isToday && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-top-1 duration-700">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Focus</h4>
                      <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed italic font-serif">
                        "{dayInfo?.focus || "Focusing on your metabolic reset through hydration and movement."}"
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button 
                        asChild
                        className="w-full lg:w-auto lg:px-12 bg-health-green hover:bg-health-green/90 text-white rounded-2xl font-bold h-16 shadow-lg shadow-emerald-950/5 text-lg"
                      >
                        <Link to="/p/$tenantSlug/today" params={{ tenantSlug }}>
                          Enter Today's Dashboard
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {isFuture && (
                  <div className="mt-4 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-medium italic">Complete previous days to reveal this protocol</span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
