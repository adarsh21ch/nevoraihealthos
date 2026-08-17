import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, Apple, Zap, Moon, RotateCcw, Target } from "lucide-react";

const pillars = [
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "training", label: "Training", icon: Zap },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "recovery", label: "Recovery", icon: RotateCcw },
  { id: "tracking", label: "Tracking", icon: Activity },
  { id: "consistency", label: "Consistency", icon: Target },
];

export function FitnessSelfScore({ onComplete }: { onComplete: (score: number, data: any) => void }) {
  const [scores, setScores] = React.useState<Record<string, number>>(
    pillars.reduce((acc, p) => ({ ...acc, [p.id]: 5 }), {})
  );

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const getResult = () => {
    if (total >= 45) return { label: "Good Foundation", color: "text-health-green", description: "You have strong habits. Let's optimize for peak performance." };
    if (total >= 30) return { label: "Clear Gaps", color: "text-amber-500", description: "You're doing well, but specific pillars need more structure." };
    return { label: "Needs Attention Now", color: "text-red-500", description: "Small changes in these pillars will yield massive results." };
  };

  const result = getResult();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pillars.map((pillar) => (
          <div key={pillar.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <pillar.icon className="w-3 h-3 text-accent" /> {pillar.label}
              </Label>
              <span className="text-sm font-bold text-ink">{scores[pillar.id]}/10</span>
            </div>
            <Slider
              value={[scores[pillar.id] ?? 5]}
              max={10}
              step={1}
              onValueChange={([val]) => setScores(prev => ({ ...prev, [pillar.id]: val ?? 5 }))}
              className="py-4"
            />
          </div>
        ))}
      </div>

      <motion.div 
        key={total}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center"
      >
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Total Pilllar Score</div>
        <div className="text-6xl font-black text-ink mb-4">{total}<span className="text-2xl text-slate-300">/60</span></div>
        <div className={`text-xl font-black uppercase tracking-widest mb-2 ${result.color}`}>{result.label}</div>
        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">{result.description}</p>
      </motion.div>

      <Button 
        onClick={() => onComplete(total, scores)}
        className="w-full h-14 rounded-2xl bg-accent text-white font-black text-[12px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl"
      >
        Save to My Assessment
      </Button>
    </div>
  );
}
