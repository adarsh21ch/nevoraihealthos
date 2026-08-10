import { createFileRoute, redirect } from "@tanstack/react-router";
import { checkAdminStatus, getTenants } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkAdminStatus();
      if (!isAdmin) {
        throw redirect({ to: "/" });
      }
    } catch (e) {
      throw redirect({ to: "/" });
    }
  },
  loader: async () => {
    return {
      tenants: await getTenants()
    };
  },
  component: AdminDashboard,
});

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
import { Loader2, Plus, Power, PowerOff } from "lucide-react";

function AdminDashboard() {
  const { tenants: initialTenants } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const getTenantsFn = useServerFn(getTenants);
  const createTenantFn = useServerFn(createTenant);
  const updateStatusFn = useServerFn(updateTenantStatus);

  const { data: tenants = initialTenants, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => getTenantsFn(),
    initialData: initialTenants,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Code</label>
                <Input 
                  required
                  placeholder="e.g. JOIN2026"
                  value={formData.accessCode}
                  onChange={e => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Tenant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">/p/{tenant.slug}</code>
                  </TableCell>
                  <TableCell>{tenant.owner_name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tenant.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => statusMutation.mutate({ 
                        id: tenant.id, 
                        status: tenant.status === 'active' ? 'suspended' : 'active' 
                      })}
                      disabled={statusMutation.isPending}
                    >
                      {tenant.status === 'active' ? (
                        <PowerOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Power className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tenants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
