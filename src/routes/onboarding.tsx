import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["current-customer"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (vars: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("customers")
        .update(vars)
        .eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-customer"] });
      setStep(s => s + 1);
    }
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name) {
        toast.error("Name is required");
        return;
      }
      updateProfileMutation.mutate({
        name: formData.name,
        phone: customer?.phone || formData.phone || "",
      });
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  if (customerLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of 8</span>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full ${i + 1 <= step ? "bg-[#16a34a]" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <CardTitle className="text-[#0f172a]">
            {step === 1 && "Basic Information"}
            {step === 2 && "Health Disclaimer"}
            {step > 2 && `Onboarding Step ${step}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  placeholder="Enter your full name" 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              {!customer?.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Number</label>
                  <Input 
                    type="tel" 
                    placeholder="+91..." 
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="prose prose-sm text-gray-600">
              <p>Please read and accept our health disclaimer before proceeding...</p>
              <p>I confirm that I am in good health and have consulted with a medical professional if I have any pre-existing conditions.</p>
            </div>
          )}

          {step > 2 && (
            <p className="text-muted-foreground italic text-center py-8">
              Step {step} (Measurements, Goals, Lifestyle) implementation follows in Phase 3.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            className="bg-[#16a34a] hover:bg-[#15803d]" 
            onClick={nextStep} 
            disabled={step === 8 || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? <Loader2 className="animate-spin" /> : (
              <>
                {step === 8 ? "Finish" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
