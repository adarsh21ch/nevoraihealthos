import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { submitBmiLead } from "@/lib/bmi.functions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Scale, Info, ChevronRight, RefreshCw, Mail, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FitnessSelfScore } from "./FitnessSelfScore";
import { WarningSignsChecklist } from "./WarningSignsChecklist";
import { SessionRegistrationForm } from "./SessionRegistrationForm";
import { getSessionSettings } from "@/lib/session.functions";
import { useQuery } from "@tanstack/react-query";

const bmiFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be under 120"),
  gender: z.string().min(1, "Gender is required"),
  height_cm: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be under 250cm"),
  weight_kg: z.number().min(25, "Weight must be at least 25kg").max(300, "Weight must be under 300kg"),
  activity_level: z.string().min(1, "Activity level is required"),
  goal: z.string().min(1, "Primary goal is required"),
  consent: z.literal(true, {
    message: "You must consent to proceed",
  }),
  self_score_data: z.any().optional(),
  warning_signs_count: z.number().optional(),
});

type BmiFormData = z.infer<typeof bmiFormSchema>;

export function BMITool() {
  const [result, setResult] = React.useState<any>(null);
  const [step, setStep] = React.useState<'form' | 'score' | 'signs'>('form');
  const [formData, setFormData] = React.useState<Partial<BmiFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [warningCount, setWarningCount] = React.useState(0);
  
  const submitLead = useServerFn(submitBmiLead);
  const fetchSessionSettings = useServerFn(getSessionSettings);
  
  const { data: sessionSettings } = useQuery({
    queryKey: ["session-settings"],
    queryFn: () => fetchSessionSettings(),
  });

  const form = useForm<BmiFormData>({
    resolver: zodResolver(bmiFormSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 0,
      gender: "",
      height_cm: 0,
      weight_kg: 0,
      activity_level: "",
      goal: "",
      consent: false as any,
    },
  });

  const onInitialSubmit = (data: BmiFormData) => {
    setFormData(data);
    setStep('score');
  };

  const onScoreComplete = (score: number, scoreData: any) => {
    setFormData(prev => ({ ...prev, self_score_data: scoreData }));
    setStep('signs');
  };

  const onSignsChange = (count: number) => {
    setWarningCount(count);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalData = { 
        ...formData, 
        warning_signs_count: warningCount,
        consent: true // Re-asserting from form step
      } as BmiFormData;
      
      const response = await submitLead({ data: finalData });
      setResult(response);
      toast.success("Assessment complete!");
      
      // Auto-scroll to result
      setTimeout(() => {
        document.getElementById('bmi-tool')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast.error(error.message || "Failed to process your request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBmiColor = (category: string) => {
    if (category.includes("Normal")) return "text-health-green";
    if (category.includes("Overweight")) return "text-amber-500";
    if (category.includes("Obese")) return "text-red-500";
    if (category.includes("Underweight")) return "text-blue-500";
    return "text-slate-500";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12" id="bmi-tool">
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-5 h-full min-h-[600px]">
            {/* Form/Interactive Side */}
            <div className="lg:col-span-3 p-8 md:p-12 flex flex-col">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-health-green flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {step === 'form' ? 'Wellness Screening' : step === 'score' ? 'Foundation Score' : 'Metabolic Signs'}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Your Assessment</div>
                      <div className="text-6xl font-black text-ink mb-2 tracking-tighter">{result.bmiValue}</div>
                      <div className={cn("text-xl font-black uppercase tracking-widest", getBmiColor(result.bmiCategory))}>
                        {result.bmiCategory}
                      </div>
                      
                      <div className="mt-10 pt-10 border-t border-slate-200/50">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="text-[9px] font-black uppercase text-slate-400 mb-2">Healthy Range</div>
                            <div className="text-lg font-bold text-ink">{result.healthyRange.min} - {result.healthyRange.max} kg</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase text-slate-400 mb-2">BMI Scale</div>
                            <div className="text-lg font-bold text-ink">Asian-Pacific</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-health-green/5 border border-health-green/10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-health-green text-white flex items-center justify-center shrink-0">
                        {result.email_sent_at ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm mb-1">
                          {result.email_sent_at ? "Official Report Ready" : "Generating AI Report..."}
                        </h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          {result.email_sent_at 
                            ? "Your personalized wellness strategy has been sent to your email inbox." 
                            : "Our AI is analyzing your metabolic markers to build your custom strategy."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-serif italic text-ink mb-2">Next Step: Live Strategy Session</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Join our founder for a deep dive into metabolic optimization.</p>
                      </div>
                      <SessionRegistrationForm 
                        nextSessionDate={sessionSettings?.next_session_at ? new Date(sessionSettings.next_session_at).toLocaleString() : undefined} 
                      />
                    </div>

                    <Button 
                      onClick={() => {
                        setResult(null);
                        setStep('form');
                        form.reset();
                      }}
                      variant="ghost"
                      className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ink"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Start New Assessment
                    </Button>
                  </motion.div>
                ) : step === 'form' ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={form.handleSubmit(onInitialSubmit)} 
                    className="space-y-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-ink mb-4">Metabolic Check-up</h2>
                      <p className="text-slate-500 text-sm font-medium">Get a science-backed assessment based on WHO Asian-Pacific thresholds.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Name</Label>
                        <Input {...form.register("name")} placeholder="Your Name" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
                        {form.formState.errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Email</Label>
                        <Input {...form.register("email")} type="email" placeholder="email@example.com" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
                        {form.formState.errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Age</Label>
                        <Input {...form.register("age", { valueAsNumber: true })} type="number" placeholder="25" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Gender</Label>
                        <Select onValueChange={(v) => form.setValue("gender", v)}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Goal</Label>
                        <Select onValueChange={(v) => form.setValue("goal", v)}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium">
                            <SelectValue placeholder="Goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="wellness">Wellness</SelectItem>
                            <SelectItem value="energy">Energy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Height (cm)</Label>
                        <Input {...form.register("height_cm", { valueAsNumber: true })} type="number" placeholder="175" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Weight (kg)</Label>
                        <Input {...form.register("weight_kg", { valueAsNumber: true })} type="number" placeholder="70" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Activity Level</Label>
                      <Select onValueChange={(v) => form.setValue("activity_level", v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium">
                          <SelectValue placeholder="Select Activity Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox 
                        id="consent" 
                        onCheckedChange={(checked) => form.setValue("consent", checked as true)}
                        className="mt-1 border-slate-200"
                      />
                      <Label htmlFor="consent" className="text-[10px] text-slate-500 font-medium">
                        I consent to the collection of my health data.
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-2xl bg-ink text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all group"
                    >
                      Next Step <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.form>
                ) : step === 'score' ? (
                  <motion.div 
                    key="score"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-10 text-center">
                      <h2 className="text-3xl font-serif italic font-bold text-ink mb-2">Foundation Score</h2>
                      <p className="text-slate-500 text-sm font-medium">Self-assess your core wellness pillars.</p>
                    </div>
                    <FitnessSelfScore onComplete={onScoreComplete} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="signs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="mb-10 text-center">
                      <h2 className="text-3xl font-serif italic font-bold text-ink mb-2">Metabolic Signs</h2>
                      <p className="text-slate-500 text-sm font-medium">Quick assessment of physical indicators.</p>
                    </div>
                    <WarningSignsChecklist onChange={onSignsChange} />
                    <Button 
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-2xl bg-ink text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all mt-8"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Results"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* info side */}
            <div className="lg:col-span-2 bg-ink p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-serif italic mb-8">Science-Backed Insights</h3>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-accent font-black text-[10px] uppercase tracking-widest">WHO Standards</h4>
                    <p className="text-sm text-white/70 leading-relaxed">Using Asian-Pacific BMI thresholds for higher clinical relevance.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-accent font-black text-[10px] uppercase tracking-widest">Metabolic Markers</h4>
                    <p className="text-sm text-white/70 leading-relaxed">Identifying patterns that influence your daily energy and hormonal balance.</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-12">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <Info className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Privacy First</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">Your data is encrypted and used only for generating your wellness profile.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
