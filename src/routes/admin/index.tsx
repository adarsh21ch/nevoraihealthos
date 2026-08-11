import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { checkAdminStatus, getTenants, getUserRole, createTenantOwnerAccount } from "@/lib/admin.functions";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createTenant, updateTenantStatus } from "@/lib/admin.functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Power, PowerOff, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "platform_admin") throw redirect({ to: "/login" });
  },
  loader: async () => {
    try {
      const tenants = await getTenants();
      return { tenants: tenants || [] };
    } catch (e) {
      console.error("Error loading tenants:", e);
      return { tenants: [] };
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { tenants: initialTenants } = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getTenantsFn = useServerFn(getTenants);
  const createTenantFn = useServerFn(createTenant);
  const updateStatusFn = useServerFn(updateTenantStatus);
  const createOwnerFn = useServerFn(createTenantOwnerAccount);

  const { data: tenants = initialTenants, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => getTenantsFn(),
    initialData: initialTenants,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState({
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    ownerEmail: "",
    ownerName: "",
    accessCode: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createTenantFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      setIsDialogOpen(false);
      setFormData({ slug: "", name: "", ownerEmail: "", ownerName: "", accessCode: "" });
      toast.success("Tenant and owner account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create tenant");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "suspended" }) => 
      updateStatusFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Tenant status updated");
    },
  });

  const ownerMutation = useMutation({
    mutationFn: (data: typeof ownerData) => createOwnerFn({ 
      data: { ...data, tenantId: selectedTenantId! } 
    }),
    onSuccess: () => {
      setIsOwnerDialogOpen(false);
      setOwnerData({ email: "", password: "" });
      toast.success("Tenant owner created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create owner");
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Infrastructure Control</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-none">Tenants</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Manage branding, deployment status, and administrative accounts for wellness distributors.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl h-12 px-8 shadow-xl shadow-slate-900/10">
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
              Onboard Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 rounded-2xl max-w-lg shadow-2xl">
            <DialogHeader className="pb-4 border-b border-slate-100">
              <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">New Tenant</DialogTitle>
            </DialogHeader>
            <form 
              className="space-y-5 pt-6"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tenant Name</label>
                <Input 
                  required
                  placeholder="e.g. FitLife Mumbai"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL Slug</label>
                  <Input 
                    required
                    placeholder="slug"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Code</label>
                  <Input 
                    required
                    placeholder="JOIN2026"
                    value={formData.accessCode}
                    onChange={e => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Owner Full Name</label>
                <Input 
                  required
                  placeholder="e.g. John Doe"
                  value={formData.ownerName}
                  onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Owner Email</label>
                <Input 
                  required
                  type="email"
                  placeholder="owner@example.com"
                  value={formData.ownerEmail}
                  onChange={e => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 mt-2" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Deploy Infrastructure"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Distributor Academy</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Access Point</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Primary Owner</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Operational Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right pr-10 py-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant: any) => (
              <TableRow key={tenant.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                <TableCell className="font-bold pl-10 py-7 text-slate-900 text-lg">{tenant.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-500 group-hover:text-slate-900 transition-colors">/p/{tenant.slug}</code>
                  </div>
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
                <TableCell className="text-right pr-8 space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all rounded-xl h-10 px-4"
                    onClick={() => {
                      setSelectedTenantId(tenant.id);
                      setIsOwnerDialogOpen(true);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Authorize</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-slate-100 transition-all rounded-xl h-10 w-10 p-0"
                    onClick={() => statusMutation.mutate({ 
                      id: tenant.id, 
                      status: tenant.status === 'active' ? 'suspended' : 'active' 
                    })}
                    disabled={statusMutation.isPending}
                  >
                    {tenant.status === 'active' ? (
                      <PowerOff className="h-4 w-4 text-slate-300 hover:text-red-500 transition-colors" />
                    ) : (
                      <Power className="h-4 w-4 text-emerald-500" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                  No managed tenants found in infrastructure.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOwnerDialogOpen} onOpenChange={setIsOwnerDialogOpen}>
        <DialogContent className="bg-white border-slate-200 rounded-2xl max-w-md shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Authorize Owner</DialogTitle>
          </DialogHeader>
          <form 
            className="space-y-5 pt-6"
            onSubmit={(e) => {
              e.preventDefault();
              ownerMutation.mutate(ownerData);
            }}
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Owner Email</label>
              <Input 
                required
                type="email"
                placeholder="owner@example.com"
                value={ownerData.email}
                onChange={e => setOwnerData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Temporary Password</label>
              <Input 
                required
                type="password"
                placeholder="Minimum 6 characters"
                value={ownerData.password}
                onChange={e => setOwnerData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-slate-50 border-slate-200 text-slate-900 h-12 px-4 rounded-xl focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 mt-2" disabled={ownerMutation.isPending}>
              {ownerMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Grant Access"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
