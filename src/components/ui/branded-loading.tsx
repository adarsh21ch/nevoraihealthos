import { Loader2 } from "lucide-react";

export function BrandedLoading() {
  return (
    <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-[9999]">
      <div className="relative mb-8">
        <div className="w-20 h-16 bg-ink rounded-2xl rotate-3 flex items-center justify-center shadow-2xl">
          <span className="text-white font-black text-3xl tracking-tighter">F2F</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-lg">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          Initializing Evolution
        </span>
      </div>
    </div>
  );
}
