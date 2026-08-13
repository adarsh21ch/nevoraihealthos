
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProgramContent } from '@/lib/program-content.functions';
import { 
  Package, CheckCircle2, Info, ChevronRight, 
  Play, Clock, Star, AlertCircle, Loader2 
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/kit')({
  component: KitPage,
});

function KitPage() {
  const { tenantSlug } = Route.useParams();
  const getKitFn = useServerFn(getProgramContent);

  const { data: result, isLoading } = useQuery({
    queryKey: ['kit', tenantSlug],
    queryFn: () => getKitFn({ data: { tenantSlug, type: 'products' } }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your kit...</div>;
  if (result?.state === 'no_content') return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
       <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No kit items yet</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">My Kit</h1>
        <p className="text-slate-400 font-medium">Your program-specific essentials.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {result?.data?.map((item: any) => (
          <ProductCard key={item.product_id} product={item.products} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm text-left active:scale-95 transition-all w-full">
          <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-200" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{product.name}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {product.kit_quantity}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
             <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[2.5rem] p-0 outline-none overflow-y-auto">
        <div className="p-8">
          <SheetHeader className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-3xl font-bold text-slate-900 leading-tight mb-2">{product.name}</SheetTitle>
                <div className="flex gap-2">
                   <Badge variant="secondary" className="rounded-full font-bold text-[9px] uppercase tracking-widest">ESSENTIAL</Badge>
                   <Badge variant="outline" className="rounded-full font-bold text-[9px] uppercase tracking-widest border-slate-200">PROTOCOL</Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-10">
            {product.video_url && (
              <div className="aspect-video rounded-[2rem] bg-slate-900 overflow-hidden relative shadow-2xl">
                {!videoLoaded ? (
                  <button 
                    onClick={() => setVideoLoaded(true)}
                    className="w-full h-full flex flex-col items-center justify-center text-white gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Watch Tutorial</span>
                  </button>
                ) : (
                  <iframe 
                    src={product.video_url} 
                    className="w-full h-full" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Star className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Why this matters</h4>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed italic">
                {product.why_in_program || "Information coming soon."}
              </p>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-slate-900" />
                  <h4 className="font-bold text-slate-900">How to use</h4>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {product.how_to_use || "Follow the protocol steps listed in your Today view."}
                </p>
              </div>

              {product.common_mistakes && (
                <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h4 className="font-bold text-red-900">Avoid these</h4>
                  </div>
                  <p className="text-sm text-red-700/70 leading-relaxed font-medium">
                    {product.common_mistakes}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={() => setIsOpen(false)} className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
              Got it
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
