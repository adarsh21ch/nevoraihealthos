import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck, Mail, Lock } from "lucide-react";
import { getUserRole } from "@/lib/admin.functions";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { role } = await getUserRole();
      if (role === "platform_admin") {
        throw redirect({ to: "/admin" });
      } else if (role === "owner" || role === "staff") {
        throw redirect({ to: "/dashboard" });
      }
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { role } = await getUserRole();
      if (role === "platform_admin") {
        navigate({ to: "/admin" });
      } else if (role === "owner" || role === "staff") {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/" });
      }
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfbf8] selection:bg-blue-100">
      {/* Left side: Visual Branding */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-20">
        <div className="relative z-10 max-w-lg space-y-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-900 font-black text-4xl shadow-2xl"
          >
            H
          </motion.div>
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-white tracking-tight leading-[1.1]">
              The command center for your health empire.
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Sign in to manage your tenants, programs, and team from a single, unified interface.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800" />
              ))}
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">Trusted by 500+ leaders</span>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[100%] h-[100%] bg-blue-600/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/4 w-[100%] h-[100%] bg-indigo-600/20 rounded-full blur-[120px]" 
          />
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-hidden">
        <div className="w-full max-w-sm relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group mb-8">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
              </Link>
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-slate-500 font-medium">Platform Admin & Staff Authentication</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="email"
                      placeholder="name@healthos.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 pl-12 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-base font-medium"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 pl-12 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-base font-medium"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xl shadow-xl shadow-slate-200" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Enter Dashboard"}
              </Button>
            </form>

            <div className="pt-10 border-t border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                This area is restricted to authorized Health OS staff and tenant administrators. All access is logged and monitored for security compliance.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Floating circles on mobile */}
        <div className="lg:hidden absolute inset-0 -z-10 pointer-events-none opacity-20">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-100 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
}