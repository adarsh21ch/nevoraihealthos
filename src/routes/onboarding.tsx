import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [programId, setProgramId] = useState("");
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
        .select("id, name, duration_days")
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
    <div className="min-h-screen bg-surface px-5 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink text-center">Set up your profile</h1>
        
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">{error}</div>}
          
          {step === 1 && (
            <div className="space-y-4">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
              <Label>Age</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
              <Label>Height (cm)</Label>
              <Input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Goal Weight (kg)</Label>
              <Input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} />
              <Label>Choose Program</Label>
              <div className="space-y-2">
                {programs?.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setProgramId(p.id)}
                    className={`w-full p-4 rounded-xl border text-left ${programId === p.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}
                  >
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.duration_days} days</p>
                  </button>
                ))}
              </div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Current Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              <Label>Natural Waist (cm)</Label>
              <Input type="number" value={waist} onChange={e => setWaist(e.target.value)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 italic">I understand that this program is for general wellness and I should consult a doctor before starting.</p>
              <div className="flex items-center gap-2">
                <Checkbox checked={consent} onCheckedChange={v => setConsent(!!v)} />
                <Label>I accept</Label>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={step === TOTAL_STEPS ? finish : next} 
          disabled={isSaving}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : step === TOTAL_STEPS ? "Finish" : "Continue"}
        </Button>
      </div>
    </div>
  );
}