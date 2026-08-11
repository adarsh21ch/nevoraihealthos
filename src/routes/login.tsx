import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get auth context
      const { data: context, error: contextError } = await supabase.rpc("get_my_auth_context");
      
      if (contextError) throw contextError;

      const { role, tenant_slug, onboarding_complete } = context as any;

      if (role === "platform_admin") {
        navigate({ to: "/admin" });
      } else if (role === "tenant_owner") {
        navigate({ to: "/dashboard" });
      } else if (role === "customer") {
        if (onboarding_complete) {
          navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug: tenant_slug } });
        } else {
          navigate({ to: "/onboarding" });
        }
      } else {
        toast.error("Account not properly configured. Contact support.");
      }
    } catch (error: any) {
      toast.error(error.message || "Incorrect email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-black overflow-hidden font-sans">
      {/* Left Side: Illustration/Brand */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-950 items-center justify-center p-12 overflow-hidden border-r border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.03)_0%,transparent_70%)]"></div>
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center font-bold text-3xl mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)]">H</div>
          <h1 className="text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Scale your <br/>
            <span className="text-zinc-500">health business.</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed font-light">
            The premier infrastructure for health coaches and wellness distributors to scale personalized programs.
          </p>
          
          <div className="mt-16 grid grid-cols-2 gap-8">
            <div>
               <div className="text-2xl font-bold text-white">100%</div>
               <div className="text-sm text-zinc-500 uppercase tracking-widest mt-1">E2E Privacy</div>
            </div>
            <div>
               <div className="text-2xl font-bold text-white">24/7</div>
               <div className="text-sm text-zinc-500 uppercase tracking-widest mt-1">AI Support</div>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-zinc-800/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center font-bold text-2xl shadow-xl">H</div>
          </div>
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="text-zinc-500">Enter your credentials to manage your Health OS.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 font-medium ml-1">Email or Identifier</Label>
              <Input
                id="email"
                type="text"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 px-4 focus:ring-1 focus:ring-white/20 transition-all rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 font-medium ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 px-4 focus:ring-1 focus:ring-white/20 transition-all rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-xl shadow-white/5 group mt-2" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
          
          <div className="pt-8 text-center text-zinc-600 text-sm">
            Powered by Nevorai AI &copy; 2026
          </div>
        </div>
      </div>
    </div>
  );
}
