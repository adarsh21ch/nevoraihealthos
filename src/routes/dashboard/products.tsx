import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, uploadProductImage } from "@/lib/products.functions";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsAdminPage,
});

function ProductsAdminPage() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(getProducts);
  const updateProductImg = useServerFn(uploadProductImage);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchProducts(),
  });

  const handleFileUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(productId);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `products/${productId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      await updateProductImg({
        data: { productId, imagePath: publicUrl }
      });

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product image updated");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-slate-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Program Products</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage images and details for the C9/Fit2Fit kit.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id} className="bg-white border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-square bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-8" />
              ) : (
                <ImageIcon className="w-12 h-12 text-slate-200" />
              )}
              <Label 
                htmlFor={`file-${product.id}`}
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-95"
              >
                {uploadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : <Upload className="w-4 h-4 text-slate-600" />}
                <Input 
                  id={`file-${product.id}`} 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  disabled={uploadingId !== null}
                  onChange={(e) => handleFileUpload(product.id, e)}
                />
              </Label>
            </div>
            <CardHeader className="px-8 pt-8 pb-2">
              <CardTitle className="text-xl font-bold text-slate-900">{product.name}</CardTitle>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{product.kit_quantity}</div>
            </CardHeader>
            <CardContent className="px-8 pb-8 flex-1">
              <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{product.daily_use}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
