import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
  },
  component: OnboardingPage,
});

const TOTAL_STEPS = 7;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [goalImportance, setGoalImportance] = useState("");
  
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [thighs, setThighs] = useState("");

  const [didDX4, setDidDX4] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["onboarding-me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const validateStep = () => {
    if (step === 2 && !name.trim()) return "Please enter your name";
    if (step === 3 && !goal) return "Please choose a goal";
    if (step === 4 && !goalImportance.trim()) return "Tell us why this matters";
    if (step === 5) {
      if (!weight || !waist) return "Weight and waist required";
    }
    if (step === 6 && didDX4 === null) return "Please select a track";
    return null;
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError(null);
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  };

  const finish = async () => {
    if (!consent) return setError("Must accept disclaimer");
    if (!me?.id) return setError("Customer not found");

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("customers").update({
          name: name.trim(),
          onboarding_complete: true,
          disclaimer_accepted_at: new Date().toISOString(),
          track: didDX4 ? 'DX4' : 'standard'
      } as any).eq("id", me.id);
      
      await supabase.from("measurements").insert({
        customer_id: me.id,
        day_number: 1,
        taken_on: new Date().toISOString().slice(0, 10),
        weight_kg: Number(weight),
        chest_cm: Number(chest) || null,
        waist_cm: Number(waist),
        hip_cm: Number(hips) || null,
        thigh_cm: Number(thighs) || null
      } as any);

      const { data: prog } = await supabase.from('programs').select('id').eq('code', 'c9').single();
      if (prog) {
        await supabase.from('participant_programs').insert({
          participant_id: user.id,
          program_id: prog.id,
          track: didDX4 ? 'DX4' : 'standard',
          start_date: new Date().toISOString().slice(0, 10)
        } as any);
      }

      navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug: 'fat-to-fit' } as any });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-6">
          <div className="w-24 h-16 bg-ink text-white rounded-3xl rotate-3 flex items-center justify-center font-black text-3xl mx-auto shadow-2xl">F2F</div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-health-green transition-all duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest border border-red-100">{error}</div>}

          {step === 1 && <div className="text-center py-4"><h2 className="text-4xl font-serif italic font-bold text-ink leading-tight">Welcome to<br/>Fat2Fit.</h2></div>}
          
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif italic font-bold text-ink">What's your name?</h2>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-14 rounded-2xl border-slate-200 text-ink focus:ring-health-green" 
                placeholder="e.g. Sarah" 
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif italic font-bold text-ink">Choose your goal.</h2>
              {["Weight management", "Better energy", "Lifestyle"].map(g => (
                <button 
                  key={g} 
                  onClick={() => setGoal(g)} 
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left transition-all duration-200", 
                    goal === g ? "border-health-green bg-health-green/5 text-health-green font-bold" : "border-slate-100 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif italic font-bold text-ink">Why is this important?</h2>
              <textarea 
                value={goalImportance} 
                onChange={e => setGoalImportance(e.target.value)} 
                className="w-full h-32 p-4 rounded-2xl border-slate-200 bg-slate-50 text-ink focus:ring-health-green outline-none focus:border-health-green" 
                placeholder="Share your motivation..."
              />
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-2 gap-4">
              <h2 className="col-span-2 text-2xl font-serif italic font-bold text-ink">Baseline Stats</h2>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 ml-1">Weight (kg)</Label>
                <Input placeholder="70" type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-12 rounded-xl text-ink" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 ml-1">Waist (cm)</Label>
                <Input placeholder="80" type="number" value={waist} onChange={e => setWaist(e.target.value)} className="h-12 rounded-xl text-ink" />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif italic font-bold text-ink">Did you do DX4 first?</h2>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setDidDX4(true)} 
                  variant={didDX4 === true ? "default" : "outline"}
                  className={cn("flex-1 h-14 rounded-2xl", didDX4 === true ? "bg-health-green hover:bg-health-green-dark" : "border-slate-200")}
                >
                  Yes
                </Button>
                <Button 
                  onClick={() => setDidDX4(false)} 
                  variant={didDX4 === false ? "default" : "outline"}
                  className={cn("flex-1 h-14 rounded-2xl", didDX4 === false ? "bg-health-green hover:bg-health-green-dark" : "border-slate-200")}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
                <h2 className="text-2xl font-serif italic font-bold text-ink">Medical Disclaimer</h2>
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 text-sm border border-slate-100">
                  I accept this is a wellness program and not medical advice. I should consult a doctor before starting any new health regimen.
                </div>
                <div className="flex items-center space-x-3 p-2">
                    <Checkbox id="terms" checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="w-5 h-5 border-slate-300 data-[state=checked]:bg-health-green data-[state=checked]:border-health-green" />
                    <Label htmlFor="terms" className="text-sm font-medium text-slate-700 cursor-pointer">I accept the notice</Label>
                </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button 
                variant="ghost" 
                onClick={() => setStep(s => s - 1)}
                className="h-14 px-6 rounded-2xl text-slate-500"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={step === TOTAL_STEPS ? finish : next} 
              className="flex-1 h-14 rounded-2xl bg-health-green hover:bg-health-green-dark text-white font-bold text-lg shadow-lg shadow-health-green/20"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                step === TOTAL_STEPS ? "Start Journey" : "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
