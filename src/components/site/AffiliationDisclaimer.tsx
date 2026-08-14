import * as React from "react";
import { ShieldCheck, Info } from "lucide-react";

export function AffiliationDisclaimer() {
  return (
    <div className="bg-slate-50 border-t border-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 text-slate-400">
        <ShieldCheck className="w-8 h-8 shrink-0 opacity-20" />
        <div className="space-y-4 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Affiliation & Usage Disclaimer</p>
          <p className="text-xs leading-relaxed font-medium">
            Fat2Fit is an independent companion app for customers who have purchased Forever Living C9/FIT1/FIT2 products through us. 
            Fat2Fit is not affiliated with, endorsed by, or sponsored by Forever Living Products. 
            Product names are trademarks of their respective owners, used here only to help you use what you've already purchased.
          </p>
        </div>
      </div>
    </div>
  );
}
