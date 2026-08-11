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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
  const [hip, setHip] = useState("");
  const [chest, setChest] = useState("");
  const [thigh, setThigh] = useState("");
  const [arm, setArm] = useState("");
  const [consent, setConsent] = useState(false);

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["onboarding-me"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, tenant_id, tenants(slug)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: programs } = useQuery({
    queryKey: ["onboarding-programs"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, subtitle, duration_days")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const tenantSlug = (me as any)?.tenants?.slug as string | undefined;

  const validateStep = () => {
    if (step === 1) {
      if (!name.trim()) return "Enter your full name";
      const a = Number(age);
      if (!a || a < 12 || a > 100) return "Enter a valid age";
      const h = Number(heightCm);
      if (!h || h < 100 || h > 250) return "Enter your height in cm";
    }
    if (step === 2) {
      const g = Number(goalWeight);
      if (!g || g < 30 || g > 250) return "Enter a realistic goal weight in kg";
      if (!programId) return "Choose a program to start";
      if (!startDate) return "Pick your start date";
    }
    if (step === 3) {
      const w = Number(weight);
      if (!w || w < 30 || w > 300) return "Enter your current weight in kg";
      const wa = Number(waist);
      if (!wa || wa < 40 || wa > 200) return "Enter your waist in cm";
    }
    if (step === 4 && !consent) return "Please confirm you have read and accept the notice";
    return null;
  };

  const next = () => {
    const message = validateStep();
    if (message) return setError(message);
    setError(null);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const optional = (value: string) => (value.trim() === "" ? undefined : Number(value));

  const finish = async () => {
    const message = validateStep();
    if (message) return setError(message);
    if (!me?.id) return setError("We could not find your customer profile. Contact your coach.");

    setIsSaving(true);
    setError(null);
    try {
      const { error: consentError } = await supabase
        .from("customers")
        .update({ health_consent_at: new Date().toISOString() })
        .eq("id", me.id);
      if (consentError) throw consentError;

      const { error: rpcError } = await supabase.rpc("complete_onboarding", {
        _customer_id: me.id,
        _name: name.trim(),
        _gender: gender,
        _age: Number(age),
        _height_cm: Number(heightCm),
        _goal_weight_kg: Number(goalWeight),
        _program_id: programId,
        _start_date: startDate,
        _weight_kg: Number(weight),
        _waist_cm: Number(waist),
        _hip_cm: optional(hip),
        _chest_cm: optional(chest),
        _thigh_cm: optional(thigh),
        _arm_cm: optional(arm),
      });
      if (rpcError) throw rpcError;

      if (tenantSlug) {
        navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug } });
      } else {
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Could not save your details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans px-5 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-ink text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto">
            H
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Let's set up your profile</h1>
          <p className="text-muted font-medium">
            A few details so your coach can follow your progress day by day.
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full accent-bg rounded-full transition-all duration-200"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              {error}
            </div>
          )}

          {loadingMe && (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          )}

          {!loadingMe && step === 1 && (
            <>
              <Field id="name" label="Full name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-slate-200" />
              </Field>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["female", "male", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`h-11 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
                        gender === g ? "border-ink text-ink bg-slate-50" : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field id="age" label="Age">
                  <Input id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="height" label="Height (cm)">
                  <Input id="height" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
              </div>
            </>
          )}

          {!loadingMe && step === 2 && (
            <>
              <Field id="goal" label="Goal weight (kg)">
                <Input id="goal" inputMode="decimal" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="h-12 rounded-xl border-slate-200" />
              </Field>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Program</span>
                {programs && programs.length > 0 ? (
                  <div className="space-y-2">
                    {programs.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProgramId(p.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                          programId === p.id ? "border-ink bg-slate-50" : "border-slate-200"
                        }`}
                      >
                        <span className="block font-bold text-ink">{p.name}</span>
                        <span className="block text-xs text-muted font-medium mt-0.5">
                          {p.subtitle ? `${p.subtitle} · ` : ""}
                          {p.duration_days} days
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-2xl">
                    No programs available yet. Ask your coach to publish one.
                  </p>
                )}
              </div>
              <Field id="start" label="Start date">
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 rounded-xl border-slate-200" />
              </Field>
            </>
          )}

          {!loadingMe && step === 3 && (
            <>
              <p className="text-xs text-muted font-medium">
                Your day-zero numbers. Only weight and waist are required.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field id="weight" label="Weight (kg)">
                  <Input id="weight" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="waist" label="Waist (cm)">
                  <Input id="waist" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="hip" label="Hip (cm)">
                  <Input id="hip" inputMode="decimal" value={hip} onChange={(e) => setHip(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="chest" label="Chest (cm)">
                  <Input id="chest" inputMode="decimal" value={chest} onChange={(e) => setChest(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="thigh" label="Thigh (cm)">
                  <Input id="thigh" inputMode="decimal" value={thigh} onChange={(e) => setThigh(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
                <Field id="arm" label="Arm (cm)">
                  <Input id="arm" inputMode="decimal" value={arm} onChange={(e) => setArm(e.target.value)} className="h-12 rounded-xl border-slate-200" />
                </Field>
              </div>
            </>
          )}

          {!loadingMe && step === 4 && (
            <>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed space-y-2">
                <p className="font-bold text-ink uppercase tracking-wider text-[10px]">Important notice</p>
                <p>
                  This app helps you follow a routine and record your own measurements. It does not
                  provide medical advice, diagnosis or treatment, and no outcome is promised.
                </p>
                <p>
                  Speak to a qualified doctor before starting, especially if you are pregnant,
                  nursing, taking medication or managing a health condition.
                </p>
                <p>
                  Your measurements and photos are visible to you and your coach only, and you can
                  ask for them to be deleted at any time.
                </p>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 cursor-pointer">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => {
                    setConsent(v === true);
                    setError(null);
                  }}
                  className="mt-0.5"
                />
                <span className="text-xs font-bold text-ink leading-relaxed">
                  I have read and accept this notice, and I consent to my details being recorded.
                </span>
              </label>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={back}
              className="h-14 px-5 rounded-2xl font-bold border-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            onClick={step === TOTAL_STEPS ? finish : next}
            disabled={isSaving || loadingMe}
            className="flex-1 h-14 accent-bg text-white font-bold rounded-2xl group"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === TOTAL_STEPS ? "Start my program" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}
