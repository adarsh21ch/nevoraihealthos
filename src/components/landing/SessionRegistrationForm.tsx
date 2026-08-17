import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { submitSessionRegistration } from "@/lib/session.functions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ChevronRight } from "lucide-react";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  consent: z.literal(true, {
    message: "Consent is required",
  }),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export function SessionRegistrationForm({ nextSessionDate }: { nextSessionDate?: string | undefined }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const register = useServerFn(submitSessionRegistration);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      consent: false as any,
    },
  });

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    try {
      await register({ data });
      setIsSuccess(true);
      toast.success("Successfully registered for the live session!");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
        <h3 className="text-2xl font-serif italic text-ink mb-4">You're on the list!</h3>
        <p className="text-slate-500 mb-6 font-medium">Check your email for the session link and calendar invite.</p>
        <div className="w-16 h-16 bg-health-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 -z-10" />
      
      <div className="mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-health-green text-[10px] font-black uppercase tracking-widest mb-4">Limited Seats</span>
        <h3 className="text-3xl font-serif italic font-bold text-ink mb-2">Join the Free Live Session</h3>
        <p className="text-slate-500 text-sm font-medium">
          {nextSessionDate ? `Next session: ${nextSessionDate}` : "Discover the methodology to fix your metabolic health."}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Name</Label>
          <Input {...form.register("name")} placeholder="Your Name" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Email</Label>
            <Input {...form.register("email")} type="email" placeholder="email@example.com" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Phone (WhatsApp)</Label>
            <Input {...form.register("phone")} placeholder="+91..." className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" />
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <Checkbox 
            id="consent-session" 
            onCheckedChange={(checked) => form.setValue("consent", checked as true)}
            className="mt-1 border-slate-200 data-[state=checked]:bg-health-green data-[state=checked]:border-health-green"
          />
          <Label htmlFor="consent-session" className="text-[10px] text-slate-500 leading-relaxed font-medium">
            I consent to receiving session reminders and wellness updates via email and WhatsApp.
          </Label>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-ink hover:bg-slate-800 text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl group"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Reserve My Spot <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
