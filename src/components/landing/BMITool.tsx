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
import { Loader2, Scale, Info, ChevronRight, RefreshCw, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { FitnessSelfScore } from "./FitnessSelfScore";
import { WarningSignsChecklist } from "./WarningSignsChecklist";

const bmiFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be under 120"),
  gender: z.string().min(1, "Gender is required"),
  height_cm: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be under 250cm"),
  weight_kg: z.number().min(25, "Weight must be at least 25kg").max(300, "Weight must be under 300kg"),
  activity_level: z.string().min(1, "Activity level is required"),
  goal: z.string().min(1, "Primary goal is required"),
  consent: z.literal(true, { message: "You must consent to proceed" }),
  self_score_data: z.any().optional(),
  warning_signs_count: z.number().optional(),
});

type BmiFormData = z.infer<typeof bmiFormSchema>;

export function BMITool() {
  const [result, setResult] = React.useState<any>(null);
  const [step, setStep] = React.useState<'form' | 'score' | 'signs'>('form');
  const [formData, setFormData] = React.useState<Partial<BmiFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submitLead = useServerFn(submitBmiLead);

  const form = useForm<BmiFormData>({
    resolver: zodResolver(bmiFormSchema),
    defaultValues: { name: "", email: "", age: 0, gender: "", height_cm: 0, weight_kg: 0, activity_level: "", goal: "", consent: false as any },
  });

  const onInitialSubmit = (data: BmiFormData) => {
    setFormData(data);
    setStep('score');
  };

  const onFinalSubmit = async (selfScore: number, scoreData: any, warningCount: number) => {
    setIsSubmitting(true);
    try {
      const fullData = { ...formData, self_score_data: scoreData, warning_signs_count: warningCount } as BmiFormData;
      const response = await submitLead({ data: fullData });
      setResult(response);
      setStep('form');
      toast.success("Assessment complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12" id="bmi-tool">
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-5 h-full">
            <div className="lg:col-span-3 p-8 md:p-12">
              <AnimatePresence mode="wait">
                {step === 'form' && !result ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-3xl font-serif italic font-bold text-ink mb-2">Metabolic Check-up</h2>
                    <p className="text-slate-500 text-sm mb-8">Personalized insights for your health journey.</p>
                    <form onSubmit={form.handleSubmit(onInitialSubmit)} className="space-y-4">
                      {/* ... form fields same as before ... */}
                      <Input {...form.register("name")} placeholder="Name" className="h-12 rounded-xl bg-slate-50" />
                      <Input {...form.register("email")} type="email" placeholder="Email" className="h-12 rounded-xl bg-slate-50" />
                      <Button type="submit" className="w-full h-14 rounded-2xl bg-ink text-white">Next</Button>
                    </form>
                  </motion.div>
                ) : step === 'score' ? (
                  <motion.div key="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-3xl font-serif italic mb-2">Fitness Self-Score</h2>
                    <FitnessSelfScore onComplete={(score, data) => { setFormData(prev => ({...prev, self_score_data: data})); setStep('signs'); }} />
                  </motion.div>
                ) : result ? (
                   // ... result UI ...
                   <div />
                ) : null}
              </AnimatePresence>
            </div>
            {/* Info side */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
