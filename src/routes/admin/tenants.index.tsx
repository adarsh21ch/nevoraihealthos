import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { getTenants, createTenant, updateTenantStatus } from "@/lib/admin.functions";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Power, PowerOff, Edit2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/tenants/")({
  component: AdminTenants,
});

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);

function AdminTenants() {
  const queryClient = useQueryClient();
  const getTenantsFn = useServerFn(getTenants);
  const createTenantFn = useServerFn(createTenant);
  const updateStatusFn = useServerFn(updateTenantStatus);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => getTenantsFn(),
    staleTime: 1000 * 60 * 5,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdTenantInfo, setCreatedTenantInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    ownerEmail: "",
    ownerName: "",
    ownerPassword: "",
    accessCode: "",
    tagline: "",
    whatsapp: "",
    phone: "",
    primaryColor: "#16a34a",
    logoUrl: "",
    customDomain: ""
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createTenantFn({ data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      setIsCreateOpen(false);
      setCreatedTenantInfo({
        ...result.tenant,
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.ownerPassword,
        accessCode: formData.accessCode
      });
      setIsSuccessOpen(true);
      setFormData({
        name: "", ownerEmail: "", ownerName: "",
        ownerPassword: "",
        accessCode: "",
        tagline: "", whatsapp: "", phone: "", primaryColor: "#16a34a", logoUrl: "", customDomain: ""
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to onboard client");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "suspended" }) => 
      updateStatusFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Status updated");
    },
  });

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const toastId = toast.loading("Processing logo...");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(blob => resolve(blob), 'image/webp', 0.85)
      );
      if (!blob) throw new Error("Compression failed");
      
      const fileName = `logo_${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('public-assets')
        .upload(fileName, blob, { cacheControl: '31536000', upsert: true });
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
      toast.success("Logo uploaded", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Tenants</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Manage wellness distributors and their white-label platforms.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-ink text-white hover:bg-slate-800 font-bold rounded-xl h-12 px-8 shadow-xl shadow-slate-900/10"
        >
          <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
          Onboard Client
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Distributor</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Portal</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Owner</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-10 py-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-slate-100">
                <TableCell colSpan={5} className="py-16 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && tenants.length === 0 && (
              <TableRow className="border-slate-100">
                <TableCell colSpan={5} className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No tenants yet — onboard your first client
                </TableCell>
              </TableRow>
            )}
            {tenants.map((tenant: any) => (
              <TableRow key={tenant.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                <TableCell className="pl-10 py-7">
                  <Link 
                    to="/admin/tenants/$tenantId" 
                    params={{ tenantId: tenant.id }}
                    className="flex items-center gap-3 font-bold text-ink text-lg hover:text-slate-600 transition-colors"
                  >
                    {tenant.logo_url && <img src={tenant.logo_url} className="w-8 h-8 rounded-lg object-contain bg-slate-50 border" loading="lazy" alt="" />}
                    {tenant.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-[11px] font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500">/p/{tenant.slug}</code>
                </TableCell>
                <TableCell className="text-slate-500 font-semibold">{tenant.owner_name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    tenant.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {tenant.status === 'active' ? 'Operational' : 'Suspended'}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-10 space-x-2">
                  <Button asChild variant="ghost" size="sm" className="rounded-xl h-10 px-3 text-slate-400 hover:text-slate-900">
                    <Link to="/admin/tenants/$tenantId" params={{ tenantId: tenant.id }} aria-label={`Manage ${tenant.name}`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-xl h-10 px-3 text-slate-400 hover:text-slate-900"
                    onClick={() => statusMutation.mutate({ id: tenant.id, status: tenant.status === 'active' ? 'suspended' : 'active' })}
                  >
                    {tenant.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4 text-emerald-500" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Onboarding Wizard */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-3xl font-bold tracking-tight">Onboard Client</h2>
            <p className="text-slate-400 mt-2 font-medium">Configure their brand and administrative infrastructure.</p>
          </div>
          <form className="p-8 space-y-8" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Business Details</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Brand / Website Name</label>
                    <Input required maxLength={60} placeholder="Fat2Fit" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-400 ml-1 pt-1">
                      Portal address:{" "}
                      <code className="text-slate-500">/p/{slugify(formData.name) || "…"}</code>
                      <span className="text-slate-300"> · alphanumeric only</span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Owner Name</label>
                    <Input required maxLength={80} placeholder="Krishna Arora" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Owner Email</label>
                    <Input required type="email" maxLength={255} placeholder="owner@example.com" value={formData.ownerEmail} onChange={e => setFormData({ ...formData, ownerEmail: e.target.value.trim() })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Owner Password</label>
                    <Input required minLength={6} type="text" placeholder="Type a password" value={formData.ownerPassword} onChange={e => setFormData({ ...formData, ownerPassword: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] font-bold text-slate-400 ml-1 pt-1">Owner signs in with this email + password — no access code.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Customer Access Code</label>
                    <Input required minLength={4} maxLength={24} placeholder="FAT2FIT2026" value={formData.accessCode} onChange={e => setFormData({ ...formData, accessCode: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })} className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold tracking-widest" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Branding</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Tagline <span className="text-slate-300">(optional)</span></label>
                    <Input maxLength={120} placeholder="Your 9-day reset starts today" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Primary Color</label>
                    <div className="flex gap-3">
                      <Input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-11 p-1 rounded-xl bg-slate-50 border-slate-200" />
                      <Input value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="flex-1 h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Logo</label>
                    <Input type="file" accept="image/*" onChange={handleUploadLogo} className="h-11 rounded-xl bg-slate-50 border-slate-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1">Custom Domain <span className="text-slate-300">(optional)</span></label>
                    <Input placeholder="fat2fit.nevorai.com" value={formData.customDomain} onChange={e => setFormData({ ...formData, customDomain: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                You set both credentials manually
              </p>
              <Button type="submit" disabled={createMutation.isPending} className="bg-ink text-white hover:bg-slate-800 font-bold rounded-xl h-11 px-8 shrink-0">
                {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Deploy System"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Card */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md bg-white rounded-[2rem] p-8 border-none shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 stroke-[3px]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Onboarding Complete</h2>
              <p className="text-slate-500 font-medium mt-1">Infrastructure is live for {createdTenantInfo?.name}.</p>
            </div>
            
            <div className="space-y-3 pt-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Join Link</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-bold text-slate-900">/p/{createdTenantInfo?.slug}/join</code>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${createdTenantInfo?.slug}/join`); toast.success("Link copied"); }}><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Access Code</p>
                    <code className="text-sm font-bold text-slate-900">{createdTenantInfo?.accessCode}</code>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner Pass</p>
                    <code className="text-sm font-bold text-slate-900">{createdTenantInfo?.ownerPassword}</code>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => setIsSuccessOpen(false)} className="w-full bg-slate-900 text-white font-bold rounded-xl h-12">Close & Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
