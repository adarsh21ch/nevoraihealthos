import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createCustomerAccount, resolveLoginIdentifier } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/p/$tenantSlug/join")({
  component: JoinPage,
});

function JoinPage() {
  const { tenantSlug } = Route.useParams();
  const navigate = useNavigate();
  const createAccountFn = useServerFn(createCustomerAccount);
  const resolveLoginFn = useServerFn(resolveLoginIdentifier);
  
  const [loading, setLoading] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    fboId: "",
    email: "",
    phone: "",
    accessCode: "",
    password: "",
    confirmPassword: "",
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!signupData.email && !signupData.phone) {
      toast.error("Please provide either an email or a phone number");
      return;
    }

    setLoading(true);
    try {
      const result = await createAccountFn({
        data: {
          tenant_slug: tenantSlug,
          access_code: signupData.accessCode,
          fbo_id: signupData.fboId,
          email: signupData.email || null,
          phone: signupData.phone || null,
          password: signupData.password,
        }
      });

      if (result.success) {
        // Sign in immediately
        const { error } = await supabase.auth.signInWithPassword({
          [result.method]: result.value,
          password: signupData.password,
        } as any);

        if (error) throw error;
        toast.success("Account created successfully!");
        navigate({ to: "/login" });
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resolved = await resolveLoginFn({ data: { identifier: loginData.identifier } });
      
      if (!resolved.found) {
        throw new Error("Invalid credentials");
      }

      const { error } = await supabase.auth.signInWithPassword({
        [resolved.method!]: resolved.value,
        password: loginData.password,
      } as any);

      if (error) throw error;
      
      navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug } });
    } catch (error: any) {
      toast.error("Invalid email, phone, FBO ID, or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-slate-200">H</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Health OS</h1>
          <p className="text-slate-500 font-medium">Distributor Portal for <span className="text-slate-900 font-bold">{tenantSlug}</span></p>
        </div>

        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-11">
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Sign Up</TabsTrigger>
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Log In</TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">FBO ID</label>
                <Input 
                  required 
                  placeholder="Forever Living ID"
                  value={signupData.fboId}
                  onChange={e => setSignupData(d => ({ ...d, fboId: e.target.value }))}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email or Phone</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    type="email" 
                    placeholder="Email"
                    value={signupData.email}
                    onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
                    className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                  <Input 
                    type="tel" 
                    placeholder="Phone"
                    value={signupData.phone}
                    onChange={e => setSignupData(d => ({ ...d, phone: e.target.value }))}
                    className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Code</label>
                <Input 
                  required 
                  placeholder="Provided by distributor"
                  value={signupData.accessCode}
                  onChange={e => setSignupData(d => ({ ...d, accessCode: e.target.value }))}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <Input 
                  required 
                  type="password"
                  placeholder="Create password"
                  value={signupData.password}
                  onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Customer Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identifier</label>
                <Input 
                  required 
                  placeholder="Email, Phone, or FBO ID"
                  value={loginData.identifier}
                  onChange={e => setLoginData(d => ({ ...d, identifier: e.target.value }))}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors" onClick={() => toast.info("Contact your distributor for password assistance.")}>
                    Forgot?
                  </button>
                </div>
                <Input 
                  required 
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enter Portal"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="pt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Secure Infrastructure &copy; 2026
        </div>
      </div>
    </div>
  );
}
