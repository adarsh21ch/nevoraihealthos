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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-slate-400 mt-1">Manage branding, features, pricing and domain.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Onboard client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
              </DialogHeader>
              <form 
                className="space-y-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(formData);
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tenant Name</label>
                  <Input 
                    required
                    placeholder="e.g. FitLife Mumbai"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Slug</label>
                  <Input 
                    required
                    placeholder="e.g. fitlife-mumbai"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Name</label>
                  <Input 
                    required
                    placeholder="e.g. John Doe"
                    value={formData.ownerName}
                    onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Email</label>
                  <Input 
                    required
                    type="email"
                    placeholder="owner@example.com"
                    value={formData.ownerEmail}
                    onChange={e => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Code</label>
                  <Input 
                    required
                    placeholder="e.g. JOIN2026"
                    value={formData.accessCode}
                    onChange={e => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Tenant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card bg-slate-900/50 border-slate-800/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/50 hover:bg-slate-800/20">
                <TableHead className="text-slate-400 pl-6">Name</TableHead>
                <TableHead className="text-slate-400">Slug</TableHead>
                <TableHead className="text-slate-400">Owner</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <TableCell className="font-medium pl-6 text-slate-100">{tenant.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-950/50 border border-slate-800/50 px-2 py-1 rounded text-blue-400">/p/{tenant.slug}</code>
                  </TableCell>
                  <TableCell className="text-slate-300">{tenant.owner_name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      tenant.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {tenant.status}
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
