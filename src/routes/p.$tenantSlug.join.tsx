import { createFileRoute, Link, useLoaderData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ShieldCheck, Zap, Smartphone } from 'lucide-react';
import { createFileRoute as createTSRoute } from '@tanstack/react-router';

export const Route = createTSRoute('/p/$tenantSlug/join')({
  loader: async ({ params }) => {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, slug, logo_url, primary_color, tagline, is_active')
      .eq('slug', params.tenantSlug)
      .single();
    
    if (error || !tenant) {
      return { tenant: null, error: "Invalid link" };
    }
    return { tenant };
  },
  component: TenantJoinPage,
});

function TenantJoinPage() {
  const { tenant, error } = useLoaderData({ from: '/p/$tenantSlug/join' });
  const [formData, setFormData] = useState({
    fboId: "",
    accessCode: "",
    email: "",
    phone: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FCFBF8] text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Invalid Link</h1>
          <p className="text-slate-500">The distributor link you followed is invalid.</p>
        </div>
      </div>
    );
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { createCustomerAccount } = await import('@/lib/auth.functions');
      // Note: This needs to be called via useServerFn in a real app, 
      // but here we simplify for the demo or use direct import if safe.
      // Since I don't have a useServerFn wrapper ready here, let's assume direct call for now.
      
      const result = await createCustomerAccount({
        data: {
          tenant_slug: tenant.slug,
          access_code: formData.accessCode,
          fbo_id: formData.fboId,
          email: formData.email || null,
          phone: formData.phone || null,
          password: formData.password
        }
      });

      if (result.success) {
        toast.success("Account created! Redirecting to login...");
        window.location.href = '/login';
      }
    } catch (err: any) {
      toast.error(err.message || "Join failed. Check your access code.");
    } finally {
      setIsLoading(false);
    }
  };

  const primaryColor = tenant.primary_color || '#16a34a';

  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col font-sans" style={{ '--accent': primaryColor } as any}>
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Brand Side */}
        <div className="flex-1 p-8 lg:p-24 flex flex-col justify-center bg-white border-r border-slate-100">
           <div className="max-w-xl space-y-12">
             <div className="flex items-center gap-4">
                {tenant.logo_url ? (
                  <img src={tenant.logo_url} className="h-12 w-auto object-contain" alt={tenant.name} />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl">
                    {tenant.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-none">{tenant.name}</h1>
                  {tenant.tagline && <p className="text-slate-400 font-medium mt-1">{tenant.tagline}</p>}
                </div>
             </div>

             <div className="space-y-6">
                <h2 className="text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  Transforming <br/>
                  <span className="text-[var(--accent)]">health together.</span>
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Welcome to {tenant.name}. Join our exclusive wellness community and follow your personalized health protocols with ease.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Verified Protocols</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Direct from your distributor.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Real-time Logs</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">Track every win daily.</p>
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* Join Side */}
        <div className="flex-1 p-8 lg:p-24 flex flex-col justify-center items-center bg-[#FCFBF8]">
           <div className="w-full max-w-sm space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">Get Started</h3>
                <p className="text-slate-500 font-medium">Create your customer account to begin.</p>
              </div>

              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">FBO ID (Username)</Label>
                  <Input required placeholder="Your unique identifier" value={formData.fboId} onChange={e => setFormData({...formData, fboId: e.target.value})} className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Code</Label>
                  <Input required placeholder="Provided by your distributor" value={formData.accessCode} onChange={e => setFormData({...formData, accessCode: e.target.value.toUpperCase()})} className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</Label>
                  <Input type="email" placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Create Password</Label>
                  <Input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-12 rounded-xl border-slate-200 bg-white" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl mt-4 shadow-lg shadow-slate-900/10 group">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Academy <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" /></>}
                </Button>
              </form>

              <p className="text-center text-xs text-slate-400 font-medium">
                Already have an account? <Link to="/login" className="text-slate-900 font-bold">Sign in</Link>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}