import { createFileRoute, useNavigate, redirect, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
      // If we are on a custom domain, check if it matches the user's tenant
      if (context.tenant && context.tenant.slug !== tenant_slug) {
        // User is logged into the wrong tenant for this domain
        // We let them through to sign out or we could force a logout
        // For now, let's redirect to their actual tenant home
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { tenant: currentTenant } = Route.useRouteContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (error) throw error;

      const { data: context, error: contextError } = await supabase.rpc("get_my_auth_context");
      
      if (contextError) throw contextError;

      const { role, tenant_slug, onboarding_complete, custom_domain } = context as any;

      if (role === "platform_admin") {
        navigate({ to: "/admin" });
      } else if (role === "tenant_owner") {
        navigate({ to: "/dashboard" });
      } else if (role === "customer") {
        // If current domain is a custom domain and doesn't match user's tenant, redirect to correct domain
        if (currentTenant && currentTenant.slug !== tenant_slug) {
          const { tenantSiteUrl } = await import("@/lib/tenant");
          const targetUrl = tenantSiteUrl({ slug: tenant_slug, custom_domain });
          window.location.href = onboarding_complete ? `${targetUrl}/today` : `${targetUrl}/onboarding`;
          return;
        }

        if (onboarding_complete) {
          navigate({ to: "/p/$tenantSlug/today", params: { tenantSlug: tenant_slug } });
        } else {
          navigate({ to: "/onboarding" });
        }
      } else {
        setError("Account not properly configured. Contact support.");
      }
    } catch (error: any) {
      setError(error.message || "Incorrect email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface font-sans">
      {/* Left Side: Brand Context */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-white border-r border-slate-100">
        <div>
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl mb-12">F</div>
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Wellness simplified.<br/>
            <span className="text-slate-400">Scale your impact.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-md font-medium leading-relaxed">
            The premier platform for Fat2Fit coaches to manage programs and onboard customers with professional portals.
          </p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">2026</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fat2Fit Edition</span>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">E2E</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Data Privacy</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex justify-center mb-12">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl">F</div>
          </div>
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-ink">Sign in</h2>
            <p className="text-muted font-medium">Access your personalized health portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email / Phone / FB ID</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Email, Phone, or Facebook ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 group mt-4" 
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
          
          <div className="pt-8 space-y-4 text-center">
            <p className="text-xs text-slate-400 font-medium">
              New here? <span className="text-ink font-bold">Contact your coach for an invite code.</span>
            </p>
            <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              Fat2Fit &copy; 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
