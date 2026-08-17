import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, CheckCircle2, PlayCircle, ShieldCheck, BookOpen, ChevronRight, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoaderData } from '@tanstack/react-router';
import defaultBookletAsset from "@/assets/landing/wellness-booklet.pdf.asset.json";
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/kit')({
  component: KitPage,
});

function KitPage() {
  const { tenantSlug } = Route.useParams();
  const { tenant } = useLoaderData({ from: '/_authenticated/p/$tenantSlug' }) as any;
  const bookletUrl = tenant?.booklet_url || defaultBookletAsset.url;
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
    <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 pt-16 pb-32 animate-in fade-in duration-700 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <Package className="w-5 h-5 text-health-green" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Gear</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-ink tracking-tighter italic font-serif leading-none">Your Reset Kit</h1>
        </div>
        <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 hidden md:block">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Protocol Verified</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <section className="bg-emerald-50 rounded-[2.5rem] p-8 lg:p-12 space-y-8 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600">
            <BookOpen className="w-6 h-6" />
            <h3 className="font-bold text-xl">Preparation Guide</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <a 
              href={bookletUrl} 

              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="text-left">
                <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Program Guide</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Full 2026 Protocol Guide</p>
              </div>
              <Download className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
            </a>
            <button className="bg-white p-6 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
              <div className="text-left">
                <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Supplement Instructions</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">How to use each kit item</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
            </button>
          </div>
        </section>

        <section className="bg-emerald-900 rounded-[2.5rem] p-8 lg:p-12 text-white space-y-6 shadow-xl shadow-emerald-900/10 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-4 text-health-green relative z-10">
              <ShieldCheck className="w-8 h-8" />
              <h3 className="font-bold text-2xl lg:text-3xl italic font-serif">Certified Quality</h3>
          </div>
          <p className="text-base lg:text-lg text-emerald-100/70 leading-relaxed font-medium relative z-10 max-w-sm">
              Every component in your reset kit is designed to work synergistically. Follow the quantities exactly as prescribed in your daily schedule.
          </p>
        </section>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Kit Components</h3>
            <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        {products?.length === 0 ? (
          <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center space-y-6 max-w-2xl mx-auto border border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mx-auto" />
            <p className="text-lg text-slate-400 font-medium italic font-serif">Supplement details will appear here once your kit is assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product) => (
              <div key={product.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                  <div className="p-10 flex-1 flex flex-col gap-8">
                      <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2">
                              <h3 className="text-3xl font-bold text-ink tracking-tight group-hover:text-health-green transition-colors italic font-serif leading-none">
                                  {product.name}
                              </h3>
                              <span className="inline-block px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  {product.kit_quantity || '1 Bottle'}
                              </span>
                          </div>
                          {product.video_url && (
                              <button className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-health-green hover:text-slate-900 transition-all flex items-center justify-center shrink-0">
                                  <PlayCircle className="w-7 h-7" />
                              </button>
                          )}
                      </div>

                      <div className="space-y-6 flex-1">
                          <div className="space-y-3">
                              <div className="text-[10px] font-black uppercase tracking-widest text-health-green">Daily Protocol</div>
                              <p className="text-base text-slate-600 font-medium leading-relaxed italic font-serif">"{product.daily_use || 'Refer to your daily schedule for timing and dosage.'}"</p>
                          </div>
                      </div>

                      <div className="pt-8 border-t border-slate-50 flex items-center gap-3 text-health-green">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Included in Reset Kit</span>
                      </div>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
