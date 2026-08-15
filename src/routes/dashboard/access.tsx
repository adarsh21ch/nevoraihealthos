import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Key, Shield, Save, Loader2, ArrowLeft, Info, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getMyTenantAccessCode, rotateTenantAccessCode } from "@/lib/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/access")({
  loader: async () => {
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const ctx = authContext as { tenant_id?: string } | null;
    if (!ctx?.tenant_id) return { tenantId: null };
    return { tenantId: ctx.tenant_id };
  },
  component: AccessControlPage,
});

function AccessControlPage() {
  const { tenantId } = useLoaderData({ from: '/dashboard/access' });
  const queryClient = useQueryClient();
  const fetchAccessCode = useServerFn(getMyTenantAccessCode);
  const updateCodeFn = useServerFn(rotateTenantAccessCode);
  
  const { data: creds, isLoading: loadingCode } = useQuery({
    queryKey: ["my-tenant-access-code"],
    queryFn: () => fetchAccessCode(),
    staleTime: 1000 * 60 * 5,
  });

  const [newCode, setNewCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (code: string) => {
      if (code.length < 4) throw new Error("Access code must be at least 4 characters");
      return updateCodeFn({ data: { tenantId: tenantId!, accessCode: code.toUpperCase() } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tenant-access-code"] });
      setNewCode("");
      toast.success("Access code updated successfully");
    },
    onError: (e: any) => toast.error(e.message)
  });

  const currentCode = creds?.accessCode ?? "…";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Access Control</h1>
          <p className="text-slate-500 font-medium">Manage how customers join your platform.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <CardHeader className="p-10 pb-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Registration Gate</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">
                  Control the unique code required for new customer accounts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Active Code</p>
                <div className="text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
                  {loadingCode ? "••••••" : currentCode}
                  <span className="text-[10px] px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full border border-emerald-200 font-bold uppercase tracking-widest h-fit">
                    Active
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <Info className="w-5 h-5 text-slate-400 shrink-0" />
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Anyone with your join link will be prompted to enter this code. <br/>
                  Share it only with your customers.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-code" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Set New Access Code</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      id="new-code"
                      placeholder="ENTER-NEW-CODE" 
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="h-14 pl-11 rounded-2xl border-slate-200 font-black tracking-widest text-lg focus-visible:ring-slate-900 transition-all uppercase"
                      maxLength={20}
                    />
                  </div>
                  <Button 
                    onClick={() => updateMutation.mutate(newCode)}
                    disabled={updateMutation.isPending || !newCode || newCode === currentCode}
                    className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                    Update Access Code
                  </Button>
                </div>
                {newCode && newCode.length < 4 && (
                  <p className="text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> Minimum 4 characters required
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 border-slate-200 border-dashed rounded-[2.5rem]">
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Security Best Practices</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                If you suspect your access code has been leaked, change it immediately. 
                Already registered customers will not be affected by code changes. 
                Only new registrations require the currently active code.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
