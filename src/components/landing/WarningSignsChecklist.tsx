import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ShieldAlert, Info } from "lucide-react";

const signs = [
  { id: "breathless", label: "Do you get breathless climbing one flight of stairs?" },
  { id: "stand_up", label: "Do you push off with your hands to stand up from a chair?" },
  { id: "winded", label: "Do you get winded walking fast or chasing a child?" },
  { id: "settle", label: "Does it take a long time for your breathing to settle after mild effort?" },
  { id: "energy", label: "Do you feel low energy through the day?" },
];

export function WarningSignsChecklist({ onChange }: { onChange: (count: number) => void }) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const count = Object.values(checked).filter(Boolean).length;

  React.useEffect(() => {
    onChange(count);
  }, [count, onChange]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        {signs.map((sign) => (
          <div 
            key={sign.id} 
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-accent/30 transition-all group"
          >
            <Checkbox 
              id={sign.id}
              checked={checked[sign.id]}
              onCheckedChange={(val) => setChecked(prev => ({ ...prev, [sign.id]: !!val }))}
              className="h-6 w-6 rounded-lg border-slate-200 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <Label htmlFor={sign.id} className="text-sm font-medium text-slate-600 cursor-pointer flex-1 group-hover:text-ink transition-colors">
              {sign.label}
            </Label>
          </div>
        ))}
      </div>

      {count > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-ink text-sm mb-1">{count} Warning Signs Identified</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              These are common metabolic signs worth paying attention to. This is not a diagnosis. 
              {count >= 3 && " Since you've identified several signs, we recommend seeing a qualified doctor for a check-up."}
            </p>
          </div>
        </motion.div>
      )}

      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-wider">
          General wellness information, not medical advice. Consult a doctor before starting any exercise programme, especially if you have a medical condition.
        </p>
      </div>
    </div>
  );
}
