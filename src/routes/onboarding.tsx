import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingWizard,
});

function OnboardingWizard() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    goal_weight: "",
    program_id: "",
    start_date: new Date().toISOString().split('T')[0],
  });

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["current-customer"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, health_consent_at, user_id, tenant_id")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (customer?.health_consent_at) {
      setStep(3);
    }
  }, [customer]);

  const updateProfileMutation = useMutation({
    mutationFn: async (vars: any) => {
      const { error } = await supabase
        .from("customers")
        .update(vars)
        .eq("id", customer?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-customer"] });
      if (step === 2) {
        toast.success("Health consent recorded");
      }
      setStep(s => s + 1);
    }
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          height_cm: parseFloat(formData.height),
          goal_weight_kg: parseFloat(formData.goal_weight),
        })
        .eq("id", customer?.id);
      if (customerError) throw customerError;

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          customer_id: customer?.id,
          program_id: formData.program_id,
          start_date: formData.start_date,
        })
        .select()
        .single();
      if (enrollmentError) throw enrollmentError;

      const { error: measureError } = await supabase
        .from("measurements")
        .insert({
          customer_id: customer?.id,
          taken_on: new Date().toISOString().split('T')[0],
          weight_kg: parseFloat(formData.weight),
        });
      if (measureError) throw measureError;
    },
    onSuccess: () => {
      toast.success("Onboarding complete!");
      window.location.href = `/p/${customer?.tenant_id}/today`;
    }
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name) { toast.error("Name is required"); return; }
      updateProfileMutation.mutate({ name: formData.name });
    } else if (step === 2) {
      if (!disclaimerAccepted) { toast.error("Please accept disclaimer"); return; }
      updateProfileMutation.mutate({ health_consent_at: new Date().toISOString() });
    } else if (step === 8) {
      finishMutation.mutate();
    } else {
      setStep(s => s + 1);
    }
  };

  if (customerLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of 8</span>
          </div>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm">Full Disclaimer Text here...</p>
              <div className="flex items-center space-x-2">
                <Checkbox id="accept" checked={disclaimerAccepted} onCheckedChange={(c) => setDisclaimerAccepted(!!c)} />
                <label htmlFor="accept" className="text-sm">I have read and agree.</label>
              </div>
            </div>
          )}
          {step > 2 && <p className="text-center">Step {step} content...</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>Back</Button>
          <Button onClick={nextStep}>
            {step === 8 ? "Finish" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
