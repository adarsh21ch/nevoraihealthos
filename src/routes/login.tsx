import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import * as React from "react";
import { resolveLoginIdentifier, createCustomerAccount } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserDestination } from "@/lib/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { BrandedLoading } from "@/components/ui/branded-loading";
import { resolveTenantHint } from "@/lib/tenant";
import { getTenantByHint } from "@/lib/tenant.functions";
import { AppLogo } from "@/components/ui/app-logo";
import { toast } from "sonner";


export const Route = createFileRoute("/login")({
  ssr: false,
  staleTime: 0,
  component: LoginPage,
});

function LoginPage() {
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  
  // Sign in states
  const [identifier, setIdentifier] = React.useState("");
  const [signInPassword, setSignInPassword] = React.useState("");
  
  // Sign up states
  const [fboId, setFboId] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [signUpPassword, setSignUpPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const checkInitialSession = async () => {
      // Synchronous storage check first to avoid timing race
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Existing session found, performing unified redirect...");
        // Re-run tenant check if context is empty
        let tenant = (Route.useRouteContext() as any)?.tenant;
        if (!tenant) {
          const hint = resolveTenantHint({ hostname: window.location.hostname, pathname: window.location.pathname, search: window.location.search });
          const result = await getTenantByHint({ data: hint! });
          tenant = result.tenant;
        }

        const { to } = await resolveUserDestination(session.user);
        
        // Use client-side navigate if possible, otherwise hard redirect if it's a different domain
        if (to.startsWith('http')) {
          window.location.replace(to);
        } else {
          navigate({ to: to as any });
        }
      } else {
        setIsAuthChecking(false);
      }
    };
    checkInitialSession();
  }, [navigate]);

  const resolveIdentifier = useServerFn(resolveLoginIdentifier);

  const signUp = useServerFn(createCustomerAccount);
  const { tenant: currentTenant } = Route.useRouteContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let loginEmail = identifier.trim();
      
      if (!loginEmail.includes('@')) {
        const resolution = await resolveIdentifier({ data: { identifier: loginEmail } });
        if (resolution.found) {
          loginEmail = resolution.value;
        }
      }

      console.log("Attempting sign in with:", loginEmail);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: signInPassword,
      });

      if (signInError) throw signInError;

      console.log("Login successful, resolving identity...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Authentication failed: No user session found");
      }

      console.log("Authenticated user:", user.email);

      console.log("Login successful, resolving destination...");
      const { to } = await resolveUserDestination(user);
      
      if (to.startsWith('http')) {
        window.location.href = to;
      } else {
        navigate({ to: to as any });
      }
    } catch (error: any) {
      console.error("Login attempt failed:", error);
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

  if (isAuthChecking) {
    return <BrandedLoading />;
  }

  return (

    <div className="min-h-screen flex flex-col lg:flex-row bg-surface font-sans">
      {/* Left Side: Brand Context */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-white border-r border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <AppLogo className="scale-125 origin-left" variant="dark" />
          </div>
          <h1 className="text-7xl font-serif italic text-ink mb-8 leading-[0.9]">
            True health,<br/>
            <span className="text-accent not-italic font-sans font-black uppercase tracking-tighter">Unlocked.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">
            Welcome to the {currentTenant?.name || 'Fat2Fit'} elite portal. Your 9-day metabolic evolution starts here.
          </p>
        </div>
        
        <div className="flex items-center gap-8 text-slate-300">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink">2026</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentTenant?.name || 'Fat2Fit'} Edition</span>
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
            <AppLogo iconOnly />
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
                authMode === "signin" ? "bg-white text-ink shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setError(null); }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                authMode === "signup" ? "bg-white text-ink shadow-sm" : "text-slate-400 hover:text-slate-600"
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
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-ink/5 transition-all"
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
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-ink/5 transition-all"
                />
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => toast.info("Please contact your coach or use the profile settings to reset your password.")}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-ink transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button 
                type="submit" 

                className="w-full h-12 bg-ink text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/10 group mt-4" 

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
                className="w-full h-12 bg-ink text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/10 group mt-4" 
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
                New here? <button onClick={() => setAuthMode("signup")} className="text-ink font-bold hover:underline">Create a program account.</button>
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
