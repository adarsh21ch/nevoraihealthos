import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Camera } from "lucide-react";
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
  const [isHeightMetric, setIsHeightMetric] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    goal_weight: "",
    program_id: "",
    start_date: new Date().toISOString().split('T')[0],
    waist: "",
    hip: "",
    chest: "",
    thigh: "",
    arm: "",
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

  const { data: programs } = useQuery({
    queryKey: ["active-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, subtitle, code")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: enrollmentCount } = useQuery({
    queryKey: ["enrollment-count", customer?.id],
    enabled: !!customer?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("enrollments")
        .select("*", { count: 'exact', head: true })
        .eq("customer_id", customer!.id);
      if (error) throw error;
      return count || 0;
    }
  });

  useEffect(() => {
    if (enrollmentCount && enrollmentCount > 0 && customer?.tenant_id) {
      window.location.href = `/p/${customer.tenant_id}/today`;
    }
  }, [enrollmentCount, customer]);

  useEffect(() => {
    if (customer?.health_consent_at && step < 3) {
      setStep(3);
    }
  }, [customer, step]);

  const updateProfileMutation = useMutation({
    mutationFn: async (vars: any) => {
      if (!customer?.id) throw new Error("Customer not found");
      const { error } = await supabase
        .from("customers")
        .update(vars)
        .eq("id", customer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-customer"] });
      setStep(s => s + 1);
    }
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!customer?.id) throw new Error("Customer not found");
      
      const heightVal = isHeightMetric 
        ? (formData.height ? parseFloat(formData.height) : 0)
        : (formData.height.includes("'") 
            ? (parseFloat(formData.height.split("'")[0] || "0") * 30.48 + parseFloat(formData.height.split("'")[1] || "0") * 2.54)
            : (parseFloat(formData.height) * 30.48));

      const { error: customerError } = await supabase
        .from("customers")
        .update({
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          height_cm: heightVal,
          goal_weight_kg: parseFloat(formData.goal_weight),
        })
        .eq("id", customer.id);
      if (customerError) throw customerError;

      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          customer_id: customer.id,
          program_id: formData.program_id as string,
          start_date: formData.start_date as string,
        });
      if (enrollmentError) throw enrollmentError;

      const { error: measureError } = await supabase
        .from("measurements")
        .insert({
          customer_id: customer.id as string,
          taken_on: new Date().toISOString().split('T')[0] as string,
          weight_kg: parseFloat(formData.weight),
          waist_cm: parseFloat(formData.waist),
          hip_cm: formData.hip ? parseFloat(formData.hip) : null,
          chest_cm: formData.chest ? parseFloat(formData.chest) : null,
          thigh_cm: formData.thigh ? parseFloat(formData.thigh) : null,
          arm_cm: formData.arm ? parseFloat(formData.arm) : null,
        });
      if (measureError) throw measureError;
    },
    onSuccess: () => {
      toast.success("Onboarding complete!");
      if (customer?.tenant_id) {
        window.location.href = `/p/${customer.tenant_id}/today`;
      }
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name) { toast.error("Name is required"); return; }
      updateProfileMutation.mutate({ name: formData.name });
    } else if (step === 2) {
      if (!disclaimerAccepted) { toast.error("Please accept disclaimer"); return; }
      updateProfileMutation.mutate({ health_consent_at: new Date().toISOString() });
    } else if (step === 3) {
      if (!formData.gender || !formData.age) { toast.error("All fields required"); return; }
      setStep(4);
    } else if (step === 4) {
      if (!formData.height) { toast.error("Height is required"); return; }
      setStep(5);
    } else if (step === 5) {
      if (!formData.weight || !formData.goal_weight) { toast.error("All fields required"); return; }
      setStep(6);
    } else if (step === 6) {
      if (!formData.program_id) { toast.error("Please select a program"); return; }
      setStep(7);
    } else if (step === 7) {
      if (!formData.start_date) { toast.error("Start date required"); return; }
      setStep(8);
    } else if (step === 8) {
      if (!formData.weight || !formData.waist) { toast.error("Weight and Waist are required"); return; }
      finishMutation.mutate();
    }
  };

  if (customerLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-sm">
        <CardHeader>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-4">
            <span>Step {step} of 8</span>
            <div className="flex gap-1 items-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full transition-colors ${i + 1 <= step ? "bg-[#16a34a]" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-[#0f172a]">
            {step === 1 && "What's your name?"}
            {step === 2 && "Health Disclaimer"}
            {step === 3 && "Tell us about yourself"}
            {step === 4 && "How tall are you?"}
            {step === 5 && "Weight goals"}
            {step === 6 && "Your Program"}
            {step === 7 && "When do you start?"}
            {step === 8 && "Baseline Measurements"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 pt-4">
              <Input 
                className="h-12 text-lg" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
              />
              <p className="text-sm text-muted-foreground">This is how your coach will address you.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-[250px] overflow-y-auto">
                <p className="font-semibold mb-2">Important Health Notice</p>
                <p>This program is not suitable for individuals who are pregnant or breastfeeding.</p>
                <p className="mt-2">Consult your doctor before starting if you have:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Type 1 Diabetes or insulin-dependent Type 2</li>
                  <li>Kidney or liver disease</li>
                  <li>Heart conditions or high blood pressure</li>
                  <li>Active cancer or eating disorders</li>
                  <li>Any condition requiring prescription medication</li>
                </ul>
                <p className="mt-2 text-xs italic">By continuing, you confirm you are not pregnant/breastfeeding and have sought medical clearance if you have any conditions above.</p>
              </div>
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="accept" 
                  checked={disclaimerAccepted} 
                  onCheckedChange={(c) => setDisclaimerAccepted(!!c)} 
                  className="mt-1"
                />
                <label htmlFor="accept" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I have read and confirm that I am fit to start this program.
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={formData.gender} onValueChange={v => setFormData(p => ({ ...p, gender: v }))}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input 
                  type="number" 
                  className="h-12" 
                  placeholder="e.g. 32" 
                  value={formData.age} 
                  onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} 
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsHeightMetric(!isHeightMetric)}>
                  Switch to {isHeightMetric ? "ft/in" : "cm"}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isHeightMetric ? "Height (cm)" : "Height (ft'in)"}</label>
                <Input 
                  className="h-12 text-center text-2xl" 
                  placeholder={isHeightMetric ? "175" : "5'9"} 
                  value={formData.height} 
                  onChange={e => setFormData(p => ({ ...p, height: e.target.value }))} 
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Weight (kg)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  className="h-12 text-2xl text-center" 
                  placeholder="85.5" 
                  value={formData.weight} 
                  onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Weight (kg)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  className="h-12 text-2xl text-center" 
                  placeholder="78.0" 
                  value={formData.goal_weight} 
                  onChange={e => setFormData(p => ({ ...p, goal_weight: e.target.value }))} 
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="grid grid-cols-1 gap-3 pt-2">
              {programs?.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setFormData(prev => ({ ...prev, program_id: p.id }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.program_id === p.id 
                    ? "border-[#16a34a] bg-green-50 shadow-sm" 
                    : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <p className="font-bold text-[#0f172a]">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                </div>
              ))}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block w-full">Pick your start date</label>
                <Input 
                  type="date" 
                  className="h-12 text-center" 
                  min={new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.start_date} 
                  onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} 
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">You can set it up to 7 days in the past if you already started.</p>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 pt-2 h-[350px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Weight (kg)*</label>
                  <Input 
                    type="number" 
                    placeholder="85.5" 
                    value={formData.weight} 
                    onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Waist (cm)*</label>
                  <Input 
                    type="number" 
                    placeholder="90" 
                    value={formData.waist} 
                    onChange={e => setFormData(p => ({ ...p, waist: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Hip</label>
                  <Input placeholder="cm" value={formData.hip} onChange={e => setFormData(p => ({ ...p, hip: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Chest</label>
                  <Input placeholder="cm" value={formData.chest} onChange={e => setFormData(p => ({ ...p, chest: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Thigh</label>
                  <Input placeholder="cm" value={formData.thigh} onChange={e => setFormData(p => ({ ...p, thigh: e.target.value }))} />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm font-bold mb-2">Take your Day 0 photo</p>
                <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-[10px] text-slate-500 text-center px-6">
                    This is the photo you'll want on Day 9. 10 seconds now.
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center italic">(Optional, can be skipped)</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6 bg-slate-50/50 rounded-b-xl">
          <Button 
            variant="ghost" 
            onClick={() => setStep(s => s - 1)} 
            disabled={step === 1 || (step === 3 && !!customer?.health_consent_at)}
            className="text-slate-500"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            className="bg-[#16a34a] hover:bg-[#15803d] px-8" 
            onClick={nextStep}
            disabled={updateProfileMutation.isPending || finishMutation.isPending}
          >
            {updateProfileMutation.isPending || finishMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
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
