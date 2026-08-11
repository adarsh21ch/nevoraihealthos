import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createCustomerAccount } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/p/$tenantSlug/join")({
  head: () => ({
    meta: [
      { title: "Join the program | Health OS" },
      {
        name: "description",
        content:
          "Create your account with your distributor's access code and start your guided wellness program.",
      },
      { property: "og:title", content: "Join the program | Health OS" },
      {
        property: "og:description",
        content: "Create your account with your distributor's access code and start your program.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { tenantSlug } = Route.useParams();
  const navigate = useNavigate();
  const signUp = useServerFn(createCustomerAccount);

  const [mode, setMode] = useState<"email" | "phone" | "facebook">("email");
  const [fboId, setFboId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [contact, setContact] = useState("");
  const [facebookId, setFacebookId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: tenant } = useQuery({
    queryKey: ["public-tenant", tenantSlug],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("name, tagline, logo_url, primary_color")
        .eq("slug", tenantSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (tenant?.primary_color) {
      document.documentElement.style.setProperty("--accent", tenant.primary_color);
    }
  }, [tenant?.primary_color]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fboId.trim()) return setError("Enter your FBO / distributor ID");
    if (!accessCode.trim()) return setError("Enter the access code your coach shared");
    
    if (mode === "facebook") {
      if (!facebookId.trim()) return setError("Enter your Facebook ID");
    } else {
      if (!contact.trim()) return setError(mode === "email" ? "Enter your email" : "Enter your phone number");
    }
    
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setIsLoading(true);
    try {
      await signUp({
        data: {
          tenant_slug: tenantSlug,
          access_code: accessCode.trim(),
          fbo_id: fboId.trim(),
          email: mode === "email" ? contact.trim() : null,
          phone: mode === "phone" ? contact.trim() : null,
          facebook_id: mode === "facebook" ? facebookId.trim() : null,
          password,
        },
      });

      const { error: signInError } = await supabase.auth.signInWithPassword(
        mode === "facebook" 
          ? { email: `${facebookId.trim()}@facebook.temp`, password } // Mock for now
          : mode === "email"
            ? { email: contact.trim(), password }
            : { phone: contact.trim(), password },
      );
      if (signInError) throw signInError;

      navigate({ to: "/onboarding" });
    } catch (err: any) {
      setError(err?.message ?? "Could not create your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={`${tenant.name} logo`}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-2xl object-cover mx-auto border border-slate-100"
            />
          ) : (
            <div className="w-14 h-14 bg-ink text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto">
              {(tenant?.name ?? "H").charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {tenant?.name ? `Join ${tenant.name}` : "Create your account"}
          </h1>
          <p className="text-muted font-medium">
            {tenant?.tagline ?? "Set up your account to start your program."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {(["email", "phone", "facebook"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                mode === m ? "bg-white text-ink shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {m === "facebook" ? "FB ID" : m}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fbo" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              FBO / Distributor ID
            </Label>
            <Input
              id="fbo"
              placeholder="e.g. 910000000000"
              value={fboId}
              onChange={(e) => setFboId(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Access code
            </Label>
            <Input
              id="code"
              placeholder="Shared by your coach"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {mode === "email" ? "Email Address" : mode === "phone" ? "Phone Number" : "Facebook ID"}
            </Label>
            {mode === "facebook" ? (
              <Input
                id="contact"
                placeholder="Your FB profile ID"
                value={facebookId}
                onChange={(e) => setFacebookId(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
              />
            ) : (
              <Input
                id="contact"
                type={mode === "email" ? "email" : "tel"}
                placeholder={mode === "email" ? "name@example.com" : "+91 ..."}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pw" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Create a password
            </Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-12 rounded-xl border-slate-200"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 accent-bg text-white font-bold rounded-2xl group"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 font-medium">
          Already registered?{" "}
          <a href="/login" className="font-bold text-ink underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
