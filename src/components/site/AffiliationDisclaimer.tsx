import * as React from "react";
import { ShieldCheck, Info } from "lucide-react";

export function AffiliationDisclaimer() {
  return (
    <div className="bg-transparent border-t border-white/5 py-8 px-6 text-slate-500">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
        <ShieldCheck className="w-6 h-6 shrink-0 opacity-20" />
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Affiliation & Usage Disclaimer</p>
          <p className="text-[10px] leading-relaxed font-medium max-w-2xl mx-auto opacity-40">
            Fat2Fit is an independent companion app for customers who have purchased Forever Living C9/FIT1/FIT2 products through us. 
            Fat2Fit is not affiliated with, endorsed by, or sponsored by Forever Living Products. 
            Product names are trademarks of their respective owners, used here only to help you use what you've already purchased.
          </p>
        </div>
      </div>
    </div>
  );
}
