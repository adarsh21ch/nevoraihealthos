import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { resolveLoginIdentifier, createCustomerAccount } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const { role, tenant_slug, onboarding_complete } = (authContext ?? {}) as any;

    if (role === "platform_admin") throw redirect({ to: "/admin" });
    if (role === "tenant_owner") throw redirect({ to: "/dashboard" });
    
    if (role === "customer" && tenant_slug) {
      if (context.tenant && context.tenant.slug !== tenant_slug) {
        const { tenantSiteUrl } = await import("@/lib/tenant");
        const targetUrl = tenantSiteUrl({ slug: tenant_slug, custom_domain: (authContext as any).custom_domain });
        window.location.href = onboarding_complete ? `${targetUrl}/today` : `${targetUrl}/onboarding`;
        return;
      }

      throw redirect(
        onboarding_complete
          ? { to: "/p/$tenantSlug/today", params: { tenantSlug: tenant_slug } }
          : { to: "/onboarding" },
      );
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  
  // Sign in states
  const [identifier, setIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign up states
  const [fboId, setFboId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const resolveIdentifier = useServerFn(resolveLoginIdentifier);
  const signUp = useServerFn(createCustomerAccount);
  const { tenant: currentTenant } = Route.useRouteContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let loginEmail = identifier;
      
      if (!identifier.includes('@')) {
        const resolution = await resolveIdentifier({ data: { identifier } });
        if (resolution.found) {
          loginEmail = resolution.value;
        }
      }

      console.log("Attempting sign in with:", loginEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: signInPassword,
      });

      if (error) {
        if (error.message.includes("Email or phone number is required")) {
          throw new Error("Please enter your email/FBO ID and password");
        }
        throw error;
      }

      console.log("Login successful, resolving identity...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed: No user session found");

      // Hardcoded client-side check for the admin email
      if (user.email === 'teamnevorai@gmail.com') {
        console.log("Platform admin recognized via email, redirecting...");
        navigate({ to: "/admin" });
        return;
      }

      const { data: context } = await supabase.rpc("get_my_auth_context");
      
      const effectiveContext = (context ?? {
        role: 'participant',
        tenant_slug: 'fat2fit',
        onboarding_complete: false
      }) as any;
      
      const { role, tenant_slug, onboarding_complete, custom_domain } = effectiveContext;

      console.log("Identity resolved:", { role, tenant_slug, onboarding_complete });

      if (role === "platform_admin") {
        navigate({ to: "/admin" });
      } else if (role === "tenant_owner") {
        navigate({ to: "/dashboard" });
      } else if (role === "participant" || role === "customer" || role === "distributor") {
        const effectiveSlug = tenant_slug || "fat2fit";
        
        if (currentTenant && currentTenant.slug !== effectiveSlug) {
          const { tenantSiteUrl } = await import("@/lib/tenant");
          const targetUrl = tenantSiteUrl({ slug: effectiveSlug, custom_domain });
          window.location.href = onboarding_complete ? `${targetUrl}/today` : `${targetUrl}/onboarding`;
          return;
        }

        if (onboarding_complete) {
          navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug: effectiveSlug } });
        } else {
          navigate({ to: "/onboarding" });
        }
      } else {
        navigate({ to: "/onboarding" });
      }
      } else {
        console.warn("Unrecognized role, falling back to dashboard:", role);
        navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      setError(error.message || "Incorrect identifier or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signUp({
        data: {
          access_code: accessCode.trim(),
          fbo_id: fboId.trim(),
          email: email.trim(),
          password: signUpPassword,
        },
      });

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: signUpPassword,
      });
      if (signInError) throw signInError;

      navigate({ to: "/onboarding" });
    } catch (err: any) {
      setError(err?.message ?? "Could not create your account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface font-sans">
      {/* Left Side: Brand Context */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-white border-r border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-16 group cursor-pointer">
            <div className="relative">
              <div className="w-16 h-14 bg-ink rounded-2xl rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center shadow-2xl">
                <span className="text-white font-black text-2xl tracking-tighter">F2F</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                 <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
            </div>
            <span className="text-3xl font-black tracking-tighter text-ink uppercase">Fat<span className="text-accent">2</span>Fit</span>
          </div>
          <h1 className="text-7xl font-serif italic text-ink mb-8 leading-[0.9]">
            True health,<br/>
            <span className="text-accent not-italic font-sans font-black uppercase tracking-tighter">Unlocked.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">
            Welcome to the Fat2Fit elite portal. Your 9-day metabolic evolution starts here.
          </p>
        </div>
        
        <div className="flex items-center gap-8 text-slate-300">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink">2026</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fat2Fit Edition</span>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink">E2E</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Data Privacy</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8 py-12">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-12 bg-accent text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-200">F2F</div>
          </div>
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              {authMode === "signin" ? "Sign in" : "Create Account"}
            </h2>
            <p className="text-muted font-medium">
              {authMode === "signin" 
                ? "Access your personalized health portal." 
                : "Enroll in the program with your access code."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => { setAuthMode("signin"); setError(null); }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                authMode === "signin" ? "bg-white text-accent shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setError(null); }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                authMode === "signup" ? "bg-white text-accent shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Join Program
            </button>
          </div>

          {authMode === "signin" ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-500">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email / FBO ID</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Email or FBO ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-accent/5 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-accent/5 transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-accent text-white hover:bg-accent/90 font-bold rounded-xl transition-all shadow-lg shadow-purple-200 group mt-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Enter Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in duration-500">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fbo" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">FBO ID</Label>
                  <Input
                    id="fbo"
                    placeholder="910..."
                    value={fboId}
                    onChange={(e) => setFboId(e.target.value)}
                    required
                    className="h-12 px-4 rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Access Code</Label>
                  <Input
                    id="code"
                    placeholder="FAT2FIT"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    className="h-12 px-4 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-accent text-white hover:bg-accent/90 font-bold rounded-xl transition-all shadow-lg shadow-purple-200 group mt-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create My Account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          )}
          
          <div className="pt-8 space-y-4 text-center">
            {authMode === "signin" && (
              <p className="text-xs text-slate-400 font-medium">
                New here? <button onClick={() => setAuthMode("signup")} className="text-accent font-bold hover:underline">Create a program account.</button>
              </p>
            )}
            <div className="space-y-1">
              <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                Fat2Fit &copy; 2026
              </div>
              <div className="text-slate-200 text-[8px] font-bold uppercase tracking-[0.2em]">
                Build by Nevorai Technologies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
