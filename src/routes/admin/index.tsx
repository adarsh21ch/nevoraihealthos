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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Admin Access Only</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Tenants</h1>
          <p className="text-zinc-500 mt-2 font-light text-lg">Manage branding, infrastructure and accounts.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-11 px-6 shadow-xl shadow-white/5">
                <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                Onboard client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-900 rounded-2xl max-w-lg">
              <DialogHeader className="pb-4 border-b border-zinc-900">
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">Create New Tenant</DialogTitle>
              </DialogHeader>
              <form 
                className="space-y-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(formData);
                }}
              >
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Tenant Name</label>
                    <Input 
                      required
                      placeholder="e.g. FitLife Mumbai"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-zinc-900/50 border-zinc-800 text-white h-11 px-4 rounded-xl focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">URL Slug</label>
                      <Input 
                        required
                        placeholder="slug"
                        value={formData.slug}
                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                        className="bg-zinc-900/50 border-zinc-800 text-white h-11 px-4 rounded-xl focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Code</label>
                      <Input 
                        required
                        placeholder="JOIN2026"
                        value={formData.accessCode}
                        onChange={e => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
                        className="bg-zinc-900/50 border-zinc-800 text-white h-11 px-4 rounded-xl focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Owner Full Name</label>
                    <Input 
                      required
                      placeholder="e.g. John Doe"
                      value={formData.ownerName}
                      onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="bg-zinc-900/50 border-zinc-800 text-white h-11 px-4 rounded-xl focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2 pb-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Owner Email</label>
                    <Input 
                      required
                      type="email"
                      placeholder="owner@example.com"
                      value={formData.ownerEmail}
                      onChange={e => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                      className="bg-zinc-900/50 border-zinc-800 text-white h-11 px-4 rounded-xl focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-xl shadow-white/5" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Deploy Infrastructure"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-zinc-900/10 border-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/20">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-8 py-4">Academy / Name</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4">Access Point</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4">Primary Owner</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4 text-center">Operational Status</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right pr-8 py-4">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.id} className="border-zinc-900 hover:bg-zinc-900/20 transition-colors group">
                  <TableCell className="font-bold pl-8 py-5 text-zinc-100 text-base">{tenant.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-400 group-hover:text-white transition-colors">/p/{tenant.slug}</code>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 font-medium">{tenant.owner_name}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      tenant.status === 'active' 
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {tenant.status === 'active' ? 'Operational' : 'Suspended'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-slate-800/50"
                      onClick={() => {
                        setSelectedTenantId(tenant.id);
                        setIsOwnerDialogOpen(true);
                      }}
                      title="Create Tenant Owner"
                    >
                      <Shield className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-slate-800/50"
                      onClick={() => statusMutation.mutate({ 
                        id: tenant.id, 
                        status: tenant.status === 'active' ? 'suspended' : 'active' 
                      })}
                      disabled={statusMutation.isPending}
                    >
                      {tenant.status === 'active' ? (
                        <PowerOff className="h-4 w-4 text-red-400" />
                      ) : (
                        <Power className="h-4 w-4 text-emerald-400" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>No tenants found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isOwnerDialogOpen} onOpenChange={setIsOwnerDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Create Tenant Owner Account</DialogTitle>
          </DialogHeader>
          <form 
            className="space-y-4 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              ownerMutation.mutate(ownerData);
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner Email</label>
              <Input 
                required
                type="email"
                placeholder="owner@example.com"
                value={ownerData.email}
                onChange={e => setOwnerData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Password</label>
              <Input 
                required
                type="password"
                placeholder="Minimum 6 characters"
                value={ownerData.password}
                onChange={e => setOwnerData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={ownerMutation.isPending}>
              {ownerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Owner Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
