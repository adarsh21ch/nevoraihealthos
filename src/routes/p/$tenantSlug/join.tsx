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
        navigate({ to: "/onboarding" });
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
      
      navigate({ to: "/today" });
    } catch (error: any) {
      toast.error("Invalid email, phone, FBO ID, or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0f172a]">Health OS</CardTitle>
          <CardDescription>Join the program or sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="login">Log In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">FBO ID</label>
                  <Input 
                    required 
                    placeholder="Your Forever Living ID"
                    value={signupData.fboId}
                    onChange={e => setSignupData(d => ({ ...d, fboId: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Optional)</label>
                    <Input 
                      type="email" 
                      placeholder="email@example.com"
                      value={signupData.email}
                      onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone (Optional)</label>
                    <Input 
                      type="tel" 
                      placeholder="+91..."
                      value={signupData.phone}
                      onChange={e => setSignupData(d => ({ ...d, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground -mt-2">Provide at least one: email or phone.</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Code</label>
                  <Input 
                    required 
                    placeholder="Provided by your distributor"
                    value={signupData.accessCode}
                    onChange={e => setSignupData(d => ({ ...d, accessCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input 
                    required 
                    type="password"
                    value={signupData.password}
                    onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input 
                    required 
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={e => setSignupData(d => ({ ...d, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email, Phone, or FBO ID</label>
                  <Input 
                    required 
                    placeholder="Enter your identifier"
                    value={loginData.identifier}
                    onChange={e => setLoginData(d => ({ ...d, identifier: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Password</label>
                    <Button variant="link" className="px-0 text-xs h-auto" type="button" onClick={() => toast.info("If you only have a phone on file, contact your distributor. Otherwise, use reset link if email exists.")}>
                      Forgot Password?
                    </Button>
                  </div>
                  <Input 
                    required 
                    type="password"
                    value={loginData.password}
                    onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
