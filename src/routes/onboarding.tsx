import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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

const TOTAL_STEPS = 4;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "other">("female");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [programId, setProgramId] = useState("7e7677a0-1e66-4fbb-9e6e-4af3c56119d2");
  const [didDX4, setDidDX4] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [consent, setConsent] = useState(false);

  const { data: me, isLoading: loadingMe } = useQuery({
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

  const { data: programs } = useQuery({
    queryKey: ["onboarding-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, code, name, duration_days")
        .order("sort_order", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const validateStep = () => {
    if (step === 1) {
      if (!name.trim()) return "Enter your full name";
      if (!age || Number(age) < 12) return "Enter a valid age";
      if (!heightCm) return "Enter your height in cm";
    }
    if (step === 2) {
      if (!goalWeight) return "Enter a goal weight";
      if (!programId) return "Choose a program";
    }
    if (step === 3) {
      if (!weight) return "Enter your weight";
      if (!waist) return "Enter your waist size";
    }
    if (step === 4 && !consent) return "Please accept the notice";
    return null;
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError(null);
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
  };

  const finish = async () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    if (!me?.id) return setError("Customer not found");

    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from("customers")
        .update({
          name: name.trim(),
          gender,
          age: Number(age),
          height_cm: Number(heightCm),
          goal_weight_kg: Number(goalWeight),
          program_id: programId,
          track: didDX4 ? 'DX4' : 'standard',
          start_date: startDate,
          onboarding_complete: true,
          disclaimer_accepted_at: new Date().toISOString()
        } as any)
        .eq("id", me.id);
      
      if (err) throw err;

      // Add baseline measurement
      await supabase.from("measurements").insert({
        customer_id: me.id,
        day_number: 1,
        taken_on: startDate,
        weight_kg: Number(weight),
        waist_cm: Number(waist)
      } as any);

      navigate({ to: "/p/fat2fit/today" as any });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface px-5 py-10 flex flex-col items-center font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-slate-200">F</div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Set up your profile</h1>
          <p className="text-slate-400 text-sm font-medium">Step {step} of {TOTAL_STEPS}</p>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">{error}</div>}
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Age</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="25" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Height (cm)</Label>
                <Input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="175" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gender</Label>
                <div className="flex gap-2">
                  {['female', 'male', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g as any)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                        gender === g ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Goal Weight (kg)</Label>
                <Input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="70" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Choose Program</Label>
                <div className="space-y-2">
                  {programs?.filter(p => ['DX4', 'C9', 'F15', 'V5'].includes(p.code)).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setProgramId(p.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all group ${programId === p.id ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/5' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.duration_days} days</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pre-Program Track</Label>
                <div 
                  onClick={() => setDidDX4(!didDX4)}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all",
                    didDX4 ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/5" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div>
                    <p className="font-bold text-slate-900">Did you complete DX4 first?</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {didDX4 ? "Yes, 18 shakes track" : "No, standard 15 shakes track"}
                    </p>
                  </div>
                  <Checkbox checked={didDX4} className="rounded-full" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-12 rounded-xl border-slate-200" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Current Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="80" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Waist Measurement (cm)</Label>
                <Input type="number" value={waist} onChange={e => setWaist(e.target.value)} className="h-12 rounded-xl border-slate-200" placeholder="90" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Take your measurements first thing in the morning for maximum accuracy.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Health Disclaimer</h3>
                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                  Before starting any new diet or exercise program, please consult with your healthcare professional. The Fat2Fit program is a wellness initiative, not medical treatment.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="terms" checked={consent} onCheckedChange={(val) => setConsent(!!val)} className="mt-1 border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                <Label htmlFor="terms" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed cursor-pointer">
                  I understand this is a nutritional program and I am responsible for my own health and well-being.
                </Label>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 h-12 rounded-xl border border-slate-100 font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            <Button 
              onClick={step === TOTAL_STEPS ? finish : next} 
              disabled={isSaving}
              className="flex-[2] h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl shadow-lg shadow-slate-900/10 group"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : step === TOTAL_STEPS ? (
                "Finish Setup"
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            Fat2Fit &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
