import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, CheckCircle2, PlayCircle, ShieldCheck, BookOpen, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/kit')({
  component: KitPage,
});

function KitPage() {
  const { tenantSlug } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['kit-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('sort_order');
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-6 pt-16 pb-24 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-40 w-full rounded-[2.5rem]" />
        <Skeleton className="h-32 w-full rounded-[2.5rem]" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
          ))}
        </div>
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
          <h2 className="text-2xl font-serif italic font-bold text-ink">Couldn't load your kit</h2>
          <p className="text-slate-500 max-w-xs mx-auto">We couldn't synchronize your supplement information.</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['kit-products'] })} variant="outline" className="rounded-2xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-32 animate-in fade-in duration-700 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-4">
           <Package className="w-5 h-5 text-health-green" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">C9 Protocol</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif leading-tight">Your Reset Kit</h1>
      </header>

      {/* Preparation Instructions */}
      <section className="bg-emerald-50 rounded-[2.5rem] p-8 space-y-6 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-600">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold">Preparation Guide</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full bg-white p-5 rounded-2xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <div className="text-left">
              <h4 className="text-sm font-bold text-ink group-hover:text-health-green transition-colors">Preparation Checklist</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Essential steps before Day 1</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-health-green transition-all" />
          </button>
          <button className="w-full bg-white p-5 rounded-2xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <div className="text-left">
              <h4 className="text-sm font-bold text-ink group-hover:text-health-green transition-colors">Supplement Instructions</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">How to use each kit item</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-health-green transition-all" />
          </button>
        </div>
      </section>

      <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldCheck className="w-20 h-20" />
        </div>
        <div className="flex items-center gap-3 text-health-green relative z-10">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="font-bold text-lg italic font-serif">Certified Quality</h3>
        </div>
        <p className="text-sm text-emerald-100/70 leading-relaxed font-medium relative z-10">
            Every component in your C9 kit is designed to work synergistically. Follow the quantities exactly as prescribed in your daily schedule.
        </p>
      </section>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-2">Kit Components</h3>
        {products?.length === 0 ? (
          <div className="bg-slate-50 rounded-[2.5rem] p-10 text-center space-y-4">
            <Package className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Supplement details will appear here once your kit is assigned.</p>
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-500">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-ink tracking-tight group-hover:text-health-green transition-colors italic font-serif">
                                {product.name}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {product.kit_quantity || '1 Bottle'}
                            </p>
                        </div>
                        {product.video_url && (
                            <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-health-green hover:text-white transition-all flex items-center justify-center">
                                <PlayCircle className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Daily Protocol</div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">{product.daily_use || 'Refer to your daily schedule for timing and dosage.'}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center gap-3 text-health-green">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Included in Reset Kit</span>
                        </div>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
