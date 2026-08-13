import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
  },
  component: OnboardingPage,
});

const TOTAL_STEPS = 6;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [goalImportance, setGoalImportance] = useState("");
  
  // Measurements
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
    if (step === 4 && !goalImportance.trim()) return "Tell us why this matters to you";
    if (step === 5) {
      if (!weight || !waist) return "Weight and waist are required for baseline tracking";
    }
    if (step === 6 && didDX4 === null) return "Please select an option for DX4";
    return null;
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError(null);
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  };

  const finish = async () => {
    if (!consent) return setError("Please accept the medical disclaimer");
    if (!me?.id) return setError("Customer not found");

    setIsSaving(true);
    try {
      // 1. Update Customer Record
      const { error: err } = await supabase
        .from("customers")
        .update({
          name: name.trim(),
          onboarding_complete: true,
          disclaimer_accepted_at: new Date().toISOString(),
          track: didDX4 ? 'DX4' : 'standard'
        } as any)
        .eq("id", me.id);
      
      if (err) throw err;

      // 2. Add baseline measurements
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

      // 3. Update Participant Program
      const { data: prog } = await supabase.from('programs').select('id').eq('code', 'c9').single();
      if (prog) {
        await supabase.from('participant_programs').insert({
          participant_id: (await supabase.auth.getUser()).data.user?.id,
          program_id: prog.id,
          track: didDX4 ? 'DX4' : 'standard',
          start_date: new Date().toISOString().slice(0, 10)
        } as any);
      }

      navigate({ to: "/p/c9/today" as any });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const goals = [
    "Weight management",
    "Better eating habits",
    "More energy",
    "Improved consistency",
    "Healthier lifestyle",
    "Custom goal"
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent text-white rounded-3xl flex items-center justify-center font-bold text-3xl mx-auto shadow-xl shadow-purple-200">F</div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-ink italic">Fit to Fit</h1>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-accent transition-all duration-500 ease-out" 
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <h2 className="text-4xl font-bold text-ink leading-tight">Welcome to<br/>Fit to Fit.</h2>
              <p className="text-slate-500 font-medium text-lg px-4">
                Let's personalize your C9 journey for maximum impact.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-ink">What's your name?</h2>
                <p className="text-slate-400 text-sm font-medium">We'll use this in your personalized portal.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-14 rounded-2xl border-slate-200 text-lg px-5 bg-slate-50/50 focus:bg-white transition-colors" 
                  placeholder="e.g. Sarah Jenkins"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-ink">Choose your goal.</h2>
                <p className="text-slate-400 text-sm font-medium">This helps us keep you motivated.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                      goal === g 
                        ? "border-accent bg-purple-50 ring-4 ring-purple-100" 
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    )}
                  >
                    <span className={cn(
                      "font-bold text-sm uppercase tracking-widest",
                      goal === g ? "text-accent" : "text-slate-600"
                    )}>{g}</span>
                    {goal === g && <CheckCircle2 className="w-5 h-5 text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-ink italic leading-tight">"Why is this goal important to you?"</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Connecting with your 'why' makes consistency easier when things get challenging.
                </p>
              </div>
              <div className="space-y-2">
                <textarea 
                  value={goalImportance} 
                  onChange={e => setGoalImportance(e.target.value)}
                  className="w-full min-h-[160px] p-5 rounded-3xl border border-slate-200 bg-slate-50/50 focus:bg-white text-ink font-medium leading-relaxed focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  placeholder="I want to feel more energetic playing with my kids..."
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-ink italic">Starting measurements</h2>
                <p className="text-slate-400 text-sm font-medium">Your Day 1 baseline. Accuracy is key.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</Label>
                  <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="85.0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chest/Back (cm)</Label>
                  <Input type="number" value={chest} onChange={e => setChest(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="102" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waist (cm)</Label>
                  <Input type="number" value={waist} onChange={e => setWaist(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="94" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hips (cm)</Label>
                  <Input type="number" value={hips} onChange={e => setHips(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="108" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thighs (cm)</Label>
                  <Input type="number" value={thighs} onChange={e => setThighs(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="62" />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold text-ink">Did you complete DX4 immediately before C9?</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setDidDX4(true)}
                        className={cn(
                            "p-6 rounded-3xl border-2 transition-all text-center space-y-2",
                            didDX4 === true ? "border-accent bg-purple-50" : "border-slate-100 bg-white"
                        )}
                    >
                        <span className="block text-2xl">⚡</span>
                        <span className="block font-black text-xs uppercase tracking-widest">Yes, DX4 First</span>
                    </button>
                    <button
                        onClick={() => setDidDX4(false)}
                        className={cn(
                            "p-6 rounded-3xl border-2 transition-all text-center space-y-2",
                            didDX4 === false ? "border-accent bg-purple-50" : "border-slate-100 bg-white"
                        )}
                    >
                        <span className="block text-2xl">🌱</span>
                        <span className="block font-black text-xs uppercase tracking-widest">No, C9 Only</span>
                    </button>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-900 font-medium leading-relaxed italic">
                  "I understand that the C9 program is a nutritional supplement program and not a substitute for professional medical advice. I am starting this journey at my own responsibility."
                </div>
                <div className="flex items-center space-x-3">
                    <Checkbox id="terms" checked={consent} onCheckedChange={(val) => setConsent(!!val)} className="w-6 h-6 rounded-lg border-slate-300 data-[state=checked]:bg-accent" />
                    <Label htmlFor="terms" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight cursor-pointer">
                      I accept the medical disclaimer
                    </Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 h-14 rounded-2xl border border-slate-100 font-black uppercase tracking-widest text-[11px]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            <Button 
              onClick={step === TOTAL_STEPS ? finish : next} 
              disabled={isSaving}
              className="flex-[2] h-14 bg-accent text-white hover:bg-accent/90 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-purple-200 group"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : step === TOTAL_STEPS ? (
                "Start My C9 Journey"
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
            Fit to Fit &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
