import { Loader2 } from "lucide-react";
import { AppLogo } from "./app-logo";

export function BrandedLoading() {
  return (
    <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-[9999]">
      <div className="relative mb-8 scale-150">
        <AppLogo iconOnly />
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
