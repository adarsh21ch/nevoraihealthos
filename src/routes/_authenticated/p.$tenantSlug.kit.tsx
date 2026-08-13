import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Info, CheckCircle2, PlayCircle, ShieldCheck, BookOpen, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/kit')({
  component: KitPage,
});

function KitPage() {
  const { data: products } = useQuery({
    queryKey: ['kit-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('sort_order');
      return data || [];
    }
  });

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-4">
           <Package className="w-5 h-5 text-accent" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">C9 Protocol</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Your Kit</h1>
      </header>

      {/* Preparation Instructions (Moved from Guide) */}
      <section className="bg-emerald-50 rounded-[2.5rem] p-8 space-y-6 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-600">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold">Preparation Guide</h3>
        </div>
        <div className="space-y-4">
          <button className="w-full bg-white p-5 rounded-2xl flex items-center justify-between group shadow-sm">
            <div className="text-left">
              <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">Preparation Checklist</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Essential steps before Day 1</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-accent transition-all" />
          </button>
          <button className="w-full bg-white p-5 rounded-2xl flex items-center justify-between group shadow-sm">
            <div className="text-left">
              <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors">Supplement Instructions</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">How to use each kit item</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-accent transition-all" />
          </button>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-xl shadow-slate-200">
        <div className="flex items-center gap-3 text-accent">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="font-bold text-lg italic font-serif">Certified Quality</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Every component in your C9 kit is designed to work synergistically. Follow the quantities exactly as prescribed in your daily schedule.
        </p>
      </section>

      <div className="space-y-6">
        {products?.map((product) => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-ink tracking-tight group-hover:text-accent transition-colors italic font-serif">
                                {product.name}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {product.kit_quantity || '1 Bottle'}
                            </p>
                        </div>
                        {product.video_url && (
                            <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-accent hover:text-white transition-all flex items-center justify-center">
                                <PlayCircle className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Daily Use</div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{product.daily_use || 'Refer to schedule'}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center gap-3 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Included in Reset Kit</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
