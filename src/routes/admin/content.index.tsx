import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { 
  getAdminPrograms, saveProgram, 
  getAdminProducts, saveProduct,
  getAdminTips, saveTip,
  getAdminFAQs, saveFAQ
} from "@/lib/admin-content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Layout, Package, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { checkAdminStatus, getUserRole } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content")({
  component: AdminContentManagement,
});

function AdminContentManagement() {
  const queryClient = useQueryClient();
  const getProgramsFn = useServerFn(getAdminPrograms);
  const getProductsFn = useServerFn(getAdminProducts);
  const getTipsFn = useServerFn(getAdminTips);
  const getFAQsFn = useServerFn(getAdminFAQs);

  const saveProgramFn = useServerFn(saveProgram);
  const saveProductFn = useServerFn(saveProduct);

  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: () => getProgramsFn(),
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProductsFn(),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/admin">Back to Tenants</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="programs" className="flex gap-2"><Layout className="h-4 w-4" /> Programs</TabsTrigger>
          <TabsTrigger value="products" className="flex gap-2"><Package className="h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="tips" className="flex gap-2"><MessageSquare className="h-4 w-4" /> Tips</TabsTrigger>
          <TabsTrigger value="faqs" className="flex gap-2"><HelpCircle className="h-4 w-4" /> FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab programs={programs} isLoading={loadingPrograms} onSave={() => queryClient.invalidateQueries({ queryKey: ["admin-programs"] })} />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductsTab products={products} isLoading={loadingProducts} onSave={() => queryClient.invalidateQueries({ queryKey: ["admin-products"] })} />
        </TabsContent>

        <TabsContent value="tips">
           <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">Tips CRUD coming in next pass</div>
        </TabsContent>

        <TabsContent value="faqs">
           <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">FAQs CRUD coming in next pass</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProgramsTab({ programs, isLoading, onSave }: any) {
  const saveProgramFn = useServerFn(saveProgram);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => saveProgramFn({ data }),
    onSuccess: () => {
      onSave();
      setIsOpen(false);
      setEditingProgram(null);
      toast.success("Program saved");
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Programs</CardTitle>
        <Button size="sm" onClick={() => { setEditingProgram({ code: "", name: "", duration_days: 9, sort_order: 0 }); setIsOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Program
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="animate-spin" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.duration_days}</TableCell>
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/content/programs/${p.id}/days` as any}>Build Days</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingProgram(p); setIsOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProgram?.id ? "Edit Program" : "New Program"}</DialogTitle></DialogHeader>
          <form className="space-y-4 pt-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(editingProgram); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Code</label>
                <Input value={editingProgram?.code} onChange={e => setEditingProgram({ ...editingProgram, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Name</label>
                <Input value={editingProgram?.name} onChange={e => setEditingProgram({ ...editingProgram, name: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Duration (Days)</label>
                <Input type="number" value={editingProgram?.duration_days} onChange={e => setEditingProgram({ ...editingProgram, duration_days: parseInt(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Sort Order</label>
                <Input type="number" value={editingProgram?.sort_order} onChange={e => setEditingProgram({ ...editingProgram, sort_order: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Hero Image URL</label>
              <div className="flex gap-2">
                <Input value={editingProgram?.hero_image_url || ""} onChange={e => setEditingProgram({ ...editingProgram, hero_image_url: e.target.value })} placeholder="https://..." />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const toastId = toast.loading("Uploading...");
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
                      const fileName = `hero_${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}.webp`;
                      const { data, error } = await supabase.storage
                        .from('public-assets')
                        .upload(fileName, blob, { cacheControl: '31536000', upsert: true });
                      if (error) throw error;
                      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(data.path);
                      setEditingProgram({ ...editingProgram, hero_image_url: publicUrl });
                      toast.success("Hero image uploaded", { id: toastId });
                    } catch (err: any) {
                      toast.error(err.message || "Upload failed", { id: toastId });
                    }
                  };
                  input.click();
                }}>
                  Upload
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Program"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ProductsTab({ products, isLoading, onSave }: any) {
  const saveProductFn = useServerFn(saveProduct);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => saveProductFn({ data }),
    onSuccess: () => {
      onSave();
      setIsOpen(false);
      setEditingProduct(null);
      toast.success("Product saved");
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button size="sm" onClick={() => { setEditingProduct({ code: "", name: "", sort_order: 0 }); setIsOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="animate-spin" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(p); setIsOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduct?.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <form className="space-y-4 pt-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(editingProduct); }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Code</label>
                <Input value={editingProduct?.code} onChange={e => setEditingProduct({ ...editingProduct, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Name</label>
                <Input value={editingProduct?.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Short Description</label>
              <Input value={editingProduct?.short_desc || ""} onChange={e => setEditingProduct({ ...editingProduct, short_desc: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Image URL (Public Assets)</label>
              <div className="flex gap-2">
                <Input value={editingProduct?.image_url || ""} onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })} placeholder="https://..." />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const toastId = toast.loading("Compressing and uploading...");
                    try {
                      // Client-side compression
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
                      
                      const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}.webp`;
                      const { data, error } = await supabase.storage
                        .from('public-assets')
                        .upload(fileName, blob, { cacheControl: '31536000', upsert: true });
                        
                      if (error) throw error;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('public-assets')
                        .getPublicUrl(data.path);
                        
                      setEditingProduct({ ...editingProduct, image_url: publicUrl });
                      toast.success("Image uploaded", { id: toastId });
                    } catch (err: any) {
                      toast.error(err.message || "Upload failed", { id: toastId });
                    }
                  };
                  input.click();
                }}>
                  Upload
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
