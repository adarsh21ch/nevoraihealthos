import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Ruler, Target, Heart, Utensils, Info, Home, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { updateMyProfile } from "@/lib/profile/profile.functions";
import { toast } from "sonner";
import { AppLogo } from "@/components/ui/app-logo";
import { AffiliationDisclaimer } from "@/components/site/AffiliationDisclaimer";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
  },
  component: OnboardingPage,
});

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Heart },
  { id: 'basic', title: 'Basics', icon: CheckCircle2 },
  { id: 'body', title: 'Measurements', icon: Ruler },
  { id: 'goal', title: 'Goals', icon: Target },
  { id: 'lifestyle', title: 'Lifestyle', icon: Info },
  { id: 'activity', title: 'Activity', icon: Info },
  { id: 'diet', title: 'Diet', icon: Utensils },
  { id: 'preferences', title: 'Avoids', icon: Utensils },
  { id: 'cooking', title: 'Cooking', icon: Utensils },
  { id: 'timing', title: 'Timing', icon: Info },
  { id: 'health', title: 'Health', icon: Heart },
  { id: 'program', title: 'Program', icon: CheckCircle2 },
  { id: 'disclaimer', title: 'Finalize', icon: CheckCircle2 },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const updateProfile = useServerFn(updateMyProfile);

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    gender: "",
    dob: "",
    height_cm: "",
    weight_kg: "",
    waist_cm: "",
    hip_cm: "",
    thigh_cm: "",
    goal: "",
    target_weight_kg: "",
    lifestyle: "",
    activity_level: "",
    diet_preference: "",
    allergies: [] as string[],
    disliked_foods: [] as string[],
    cooking_access: "",
    wake_time: "",
    sleep_time: "",
    health_concerns: "",
    track: "standard",
    consent: false,
    affiliation_acknowledged: false
  });


  const { data: me } = useQuery({
    queryKey: ["onboarding-me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (me) {
      setFormData(prev => ({
        ...prev,
        name: me.name || "",
        gender: me.gender || "",
        track: (me as any).track || "standard"
      }));
    }
  }, [me]);

  const validateStep = () => {
    const currentStepId = STEPS[step]?.id;
    if (currentStepId === 'basic') {
      if (!formData.name.trim()) return "Name is required";
      if (!formData.dob) return "Date of Birth is required";
      if (!formData.gender) return "Gender is required";
    }
    if (currentStepId === 'body') {
      if (!formData.height_cm || !formData.weight_kg || !formData.waist_cm) return "Height, Weight, and Waist are required";
    }
    if (currentStepId === 'goal') {
      if (!formData.goal) return "Please choose a goal";
    }
    if (currentStepId === 'lifestyle') {
      if (!formData.lifestyle) return "Please select your lifestyle";
    }
    if (currentStepId === 'activity') {
      if (!formData.activity_level) return "Please select your activity level";
    }
    if (currentStepId === 'diet') {
      if (!formData.diet_preference) return "Please select your diet preference";
    }
    if (currentStepId === 'preferences') {
      if (formData.disliked_foods.length === 0) return "Please select at least one item or 'None'";
    }
    if (currentStepId === 'cooking') {
      if (!formData.cooking_access) return "Please select your cooking access";
    }
    if (currentStepId === 'timing') {
      if (!formData.wake_time || !formData.sleep_time) return "Please set your wake and sleep times";
    }
    if (currentStepId === 'health') {
      // Health concerns are optional, but we want to ensure allergies is an array
    }

    return null;
  };

  const next = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError(null);
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    setStep(s => Math.max(0, s - 1));
  };

  const finish = async () => {
    if (!formData.affiliation_acknowledged) return setError("Must acknowledge program affiliation disclaimer");
    if (!formData.consent) return setError("Must accept health disclaimer");

    if (!me?.id) return setError("Profile not found");

    setIsSaving(true);
    try {
      const genderMap: Record<string, string> = {
        'Male': 'male',
        'Female': 'female',
        'Other': 'other'
      };

      await updateProfile({
        data: {
          name: formData.name.trim(),
          gender: genderMap[formData.gender] || formData.gender,
          dob: formData.dob,
          height_cm: Number(formData.height_cm),
          weight_kg: Number(formData.weight_kg),
          waist_cm: Number(formData.waist_cm),
          hip_cm: formData.hip_cm ? Number(formData.hip_cm) : null,
          thigh_cm: formData.thigh_cm ? Number(formData.thigh_cm) : null,
          goal: formData.goal,
          target_weight_kg: formData.target_weight_kg ? Number(formData.target_weight_kg) : null,
          lifestyle: formData.lifestyle,
          activity_level: formData.activity_level,
          diet_preference: formData.diet_preference,
          allergies: formData.allergies,
          disliked_foods: formData.disliked_foods,
          cooking_access: formData.cooking_access,
          meal_timing: {
            wake_time: formData.wake_time,
            sleep_time: formData.sleep_time
          },
          health_concerns: formData.health_concerns,
          track: formData.track as any,
          onboarding_complete: true
        }
      });

      // Also update baseline measurements
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("measurements").insert({
          customer_id: me.id,
          day_number: 1,
          taken_on: new Date().toISOString().slice(0, 10),
          weight_kg: Number(formData.weight_kg),
          waist_cm: Number(formData.waist_cm),
          hip_cm: formData.hip_cm ? Number(formData.hip_cm) : null,
          thigh_cm: formData.thigh_cm ? Number(formData.thigh_cm) : null
        } as any);
      }


      toast.success("Profile completed!");
      navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug: 'fat2fit' } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentStep = STEPS[step];
  if (!currentStep) return null;


  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header & Progress */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              aria-label="Back to Fat2Fit home"
              className="flex items-center gap-3 group active:scale-95 transition-transform"
            >
              <AppLogo />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-health-green transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Back to site
            </Link>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-health-green transition-all duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">
              <span>Step {step + 1} of {STEPS.length}</span>
              <span>{Math.round(((step + 1) / STEPS.length) * 100)}% Complete</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm min-h-[450px] flex flex-col">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Welcome */}
                {currentStep.id === 'welcome' && (
                  <div className="text-center py-6 space-y-6">
                    <h2 className="text-4xl font-serif italic font-bold text-ink leading-tight">Your health journey<br/>starts here.</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">Let's personalize your program by getting to know you better. This takes about 3 minutes.</p>
                    
                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="affiliation" 
                          checked={formData.affiliation_acknowledged} 
                          onCheckedChange={(checked) => updateField('affiliation_acknowledged', checked === true)}
                          className="w-5 h-5 rounded-md border-emerald-200 data-[state=checked]:bg-health-green data-[state=checked]:border-health-green"
                        />
                        <label
                          htmlFor="affiliation"
                          className="text-[10px] font-black uppercase tracking-widest text-emerald-800 cursor-pointer"
                        >
                          Acknowledge Affiliation
                        </label>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-health-green opacity-40" />
                    </div>
                  </div>
                )}


                {/* Basics */}
                {currentStep.id === 'basic' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">The Basics</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                        <Input 
                          value={formData.name} 
                          onChange={e => updateField('name', e.target.value)} 
                          className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-ink font-bold focus:border-health-green/30" 
                          placeholder="Name" 

                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                        <Input 
                          type="date"
                          value={formData.dob} 
                          onChange={e => updateField('dob', e.target.value)} 
                          className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 text-ink font-bold focus:border-health-green/30" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sex</Label>
                        <div className="flex gap-2">
                          {['Male', 'Female', 'Other'].map(g => (
                            <button
                              key={g}
                              onClick={() => updateField('gender', g)}
                              className={cn(
                                "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                formData.gender === g ? "bg-health-green text-white border-health-green shadow-lg shadow-health-green/20" : "border-slate-100 text-slate-400 hover:border-slate-200"
                              )}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Body Measurements */}
                {currentStep.id === 'body' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif italic font-bold text-ink">Body Measurements</h2>
                      <p className="text-[10px] text-slate-400 leading-relaxed">We use these to calculate your metabolic targets. Accuracy is key.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 ml-1">Height (cm)</Label>
                        <Input type="number" value={formData.height_cm} onChange={e => updateField('height_cm', e.target.value)} className="h-12 rounded-xl bg-slate-50/50 text-ink font-bold" placeholder="170" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 ml-1">Weight (kg)</Label>
                        <Input type="number" value={formData.weight_kg} onChange={e => updateField('weight_kg', e.target.value)} className="h-12 rounded-xl bg-slate-50/50 text-ink font-bold" placeholder="70" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 ml-1">Waist (cm)</Label>
                        <Input type="number" value={formData.waist_cm} onChange={e => updateField('waist_cm', e.target.value)} className="h-12 rounded-xl bg-slate-50/50 text-ink font-bold" placeholder="85" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 ml-1 text-[9px]">Target Weight (kg)</Label>
                        <Input type="number" value={formData.target_weight_kg} onChange={e => updateField('target_weight_kg', e.target.value)} className="h-12 rounded-xl bg-slate-50/50 text-ink font-bold" placeholder="65" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Goal */}
                {currentStep.id === 'goal' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">What is your goal?</h2>
                    <div className="space-y-2">
                      {['Weight Loss', 'Weight Management', 'Body Composition', 'Energy & Habits'].map(g => (
                        <button
                          key={g}
                          onClick={() => updateField('goal', g)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left text-[11px] font-black uppercase tracking-widest transition-all",
                            formData.goal === g ? "bg-health-green text-white border-health-green shadow-lg shadow-health-green/20" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {currentStep.id === 'lifestyle' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Your Lifestyle</h2>
                    <div className="grid grid-cols-1 gap-2">
                      {['Office Worker', 'Business Owner', 'Student', 'Homemaker', 'Shift Worker', 'Retired'].map(l => (
                        <button
                          key={l}
                          onClick={() => updateField('lifestyle', l)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left text-[11px] font-black uppercase tracking-widest transition-all",
                            formData.lifestyle === l ? "bg-health-green text-white border-health-green shadow-md shadow-health-green/20" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity */}
                {currentStep.id === 'activity' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Activity Level</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'sedentary', label: 'Sedentary', desc: 'Mostly sitting, little movement' },
                        { id: 'light', label: 'Lightly Active', desc: '1-3 days of light exercise' },
                        { id: 'moderate', label: 'Moderately Active', desc: '3-5 days of moderate exercise' },
                        { id: 'very', label: 'Very Active', desc: 'Daily intense exercise' }
                      ].map(a => (
                        <button
                          key={a.id}
                          onClick={() => updateField('activity_level', a.id)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left transition-all",
                            formData.activity_level === a.id ? "bg-health-green text-white border-health-green shadow-lg shadow-health-green/20" : "border-slate-100 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          <div className={cn("text-[10px] font-black uppercase tracking-widest mb-1", formData.activity_level === a.id ? "text-slate-900" : "text-ink")}>{a.label}</div>
                          <div className={cn("text-[10px] font-medium opacity-70", formData.activity_level === a.id ? "text-slate-900" : "text-slate-400")}>{a.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diet */}
                {currentStep.id === 'diet' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Dietary Preference</h2>
                    <div className="space-y-2">
                      {['Vegetarian', 'Non-Vegetarian', 'Egg-Inclusive', 'Vegan'].map(d => (
                        <button
                          key={d}
                          onClick={() => updateField('diet_preference', d)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left text-[11px] font-black uppercase tracking-widest transition-all",
                            formData.diet_preference === d ? "bg-health-green text-slate-900 border-health-green shadow-md" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Preferences - Avoids */}

                {currentStep.id === 'preferences' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Food Avoidance</h2>
                    <p className="text-[10px] text-slate-400">Which foods do you typically avoid or dislike?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Dairy', 'Gluten', 'Sugar', 'Caffeine', 'Processed', 'Nuts', 'Soy', 'None'].map(f => {

                        const isSelected = formData.disliked_foods.includes(f);
                        return (
                          <button
                            key={f}
                            onClick={() => {
                              const next = isSelected 
                                ? formData.disliked_foods.filter(i => i !== f)
                                : [...formData.disliked_foods, f];
                              updateField('disliked_foods', next);
                            }}
                            className={cn(
                              "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              isSelected ? "bg-health-green text-slate-900 border-health-green shadow-sm" : "border-slate-100 text-slate-400"
                            )}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* Cooking Access */}
                {currentStep.id === 'cooking' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Cooking & Access</h2>
                    <div className="space-y-2">
                      {['Full Kitchen', 'Basic Access', 'Limited (Hostel/Office)', 'No Cooking'].map(c => (
                        <button
                          key={c}
                          onClick={() => updateField('cooking_access', c)}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left text-[11px] font-black uppercase tracking-widest transition-all",
                            formData.cooking_access === c ? "bg-health-green text-slate-900 border-health-green shadow-lg" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timing */}
                {currentStep.id === 'timing' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Meal Timing</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Wake up time</Label>
                        <Input type="time" value={formData.wake_time} onChange={e => updateField('wake_time', e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 text-ink font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sleep time</Label>
                        <Input type="time" value={formData.sleep_time} onChange={e => updateField('sleep_time', e.target.value)} className="h-14 rounded-2xl bg-slate-50/50 text-ink font-bold" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Concerns */}
                {currentStep.id === 'health' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Health Concerns</h2>
                    <p className="text-[10px] text-slate-400">Any allergies or health issues we should know about?</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Allergies (comma separated)</Label>
                        <Input 
                          placeholder="e.g. Peanuts, Shellfish" 
                          value={formData.allergies.join(', ')} 
                          onChange={e => updateField('allergies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                          className="h-14 rounded-2xl bg-slate-50/50 text-ink font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Other Concerns</Label>
                        <textarea 
                          className="w-full h-32 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-ink font-bold text-sm" 
                          placeholder="e.g. Hypertension, Diabetes, etc."
                          value={formData.health_concerns}
                          onChange={e => updateField('health_concerns', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === 'program' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Select Program</h2>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateField('track', 'standard')}
                        className={cn(
                          "flex-1 p-6 rounded-[2.5rem] border text-center space-y-2 transition-all",
                          formData.track === 'standard' ? "bg-health-green text-white border-health-green shadow-xl shadow-health-green/20" : "border-slate-100 text-slate-400"
                        )}
                      >
                        <div className="text-2xl font-serif italic font-bold">Standard</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Full Body Reset</div>
                      </button>
                      <button
                        onClick={() => updateField('track', 'DX4')}
                        className={cn(
                          "flex-1 p-6 rounded-[2.5rem] border text-center space-y-2 transition-all",
                          formData.track === 'DX4' ? "bg-health-green text-white border-health-green shadow-xl shadow-health-green/20" : "border-slate-100 text-slate-400"
                        )}
                      >
                        <div className="text-2xl font-serif italic font-bold">DX4</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Advanced Prep</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {currentStep.id === 'disclaimer' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif italic font-bold text-ink">Ready to Start?</h2>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">"I acknowledge that Fat2Fit is a wellness program and not medical advice. I will consult my doctor before starting."</p>
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="consent" 
                          checked={formData.consent} 
                          onCheckedChange={v => updateField('consent', !!v)} 
                          className="w-5 h-5 rounded-md border-slate-200 data-[state=checked]:bg-health-green"
                        />
                        <Label htmlFor="consent" className="text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer">I Accept</Label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-6 pt-8">
            <div className="flex gap-4">
              {step > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={back}
                  className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={step === STEPS.length - 1 ? finish : next} 
                className="flex-1 h-14 rounded-2xl bg-health-green hover:bg-health-green-dark text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-lg shadow-health-green/20"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <span className="relative z-10">
                    {step === STEPS.length - 1 ? "Start Journey" : "Continue"}
                  </span>
                )}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-slate-50 opacity-40">
              <AffiliationDisclaimer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}