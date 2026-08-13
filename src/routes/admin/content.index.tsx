import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Layout, Package, MessageSquare, HelpCircle, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content/")({
  component: AdminContentManagement,
});

function AdminContentManagement() {
  const queryClient = useQueryClient();
  const getProgramsFn = useServerFn(getAdminPrograms);
  const getProductsFn = useServerFn(getAdminProducts);
  const getTipsFn = useServerFn(getAdminTips);
  const getFAQsFn = useServerFn(getAdminFAQs);

  const { data: programs, isLoading: loadingPrograms } = useQuery({ queryKey: ["admin-programs"], queryFn: () => getProgramsFn() });
  const { data: products, isLoading: loadingProducts } = useQuery({ queryKey: ["admin-products"], queryFn: () => getProductsFn() });
  const { data: tips, isLoading: loadingTips } = useQuery({ queryKey: ["admin-tips"], queryFn: () => getTipsFn() });
  const { data: faqs, isLoading: loadingFAQs } = useQuery({ queryKey: ["admin-faqs"], queryFn: () => getFAQsFn() });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none font-serif italic">Content Management</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Global library for programs, products, and insights.</p>
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 p-1 rounded-2xl h-14">
          <TabsTrigger value="programs" className="flex gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all">
            <Layout className="h-4 w-4" /> Programs
          </TabsTrigger>
          <TabsTrigger value="products" className="flex gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all">
            <Package className="h-4 w-4" /> Products
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all">
            <MessageSquare className="h-4 w-4" /> Tips
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all">
            <HelpCircle className="h-4 w-4" /> FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab programs={programs} isLoading={loadingPrograms} onSave={() => queryClient.invalidateQueries({ queryKey: ["admin-programs"] })} />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab products={products} isLoading={loadingProducts} onSave={() => queryClient.invalidateQueries({ queryKey: ["admin-products"] })} />
        </TabsContent>
        <TabsContent value="tips">
          <FastListTab 
            data={tips} 
            isLoading={loadingTips} 
            onSave={(data: any) => saveTip({ data })}
            queryKey={["admin-tips"]}
            columns={[
              { label: "Category", field: "category", type: "text" },
              { label: "Title", field: "title", type: "text" },
              { label: "Body", field: "body", type: "textarea" },
              { label: "Order", field: "sort_order", type: "number" }
            ]}
          />
        </TabsContent>
        <TabsContent value="faqs">
          <FastListTab 
            data={faqs} 
            isLoading={loadingFAQs} 
            onSave={(data: any) => saveFAQ({ data })}
            queryKey={["admin-faqs"]}
            columns={[
              { label: "Category", field: "category", type: "text" },
              { label: "Question", field: "question", type: "text" },
              { label: "Answer", field: "answer", type: "textarea" },
              { label: "Order", field: "sort_order", type: "number" }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FastListTab({ data, isLoading, onSave, queryKey, columns }: any) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>(data || []);
  
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: onSave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Saved");
    }
  });

  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden bg-white">
      <CardHeader className="flex flex-row justify-between items-center p-8 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Editor</CardTitle>
        <Button 
          size="sm" 
          onClick={() => setItems([...items, { sort_order: items.length }])}
          className="bg-accent text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-purple-100"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Row
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin h-6 w-6 text-slate-300 mx-auto" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/30 hover:bg-slate-50/30">
                {columns.map((col: any) => (
                  <TableHead key={col.field} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">{col.label}</TableHead>
                ))}
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6 text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  {columns.map((col: any) => (
                    <TableCell key={col.field} className="py-6">
                      {col.type === "textarea" ? 
                        <Textarea 
                          defaultValue={item[col.field]} 
                          onBlur={(e) => setItems(items.map((i, k) => k === idx ? { ...i, [col.field]: e.target.value } : i))} 
                          className="min-h-[100px] rounded-xl border-slate-200"
                        /> :
                        <Input 
                          type={col.type} 
                          defaultValue={item[col.field]} 
                          onBlur={(e) => setItems(items.map((i, k) => k === idx ? { ...i, [col.field]: col.type === "number" ? parseInt(e.target.value) : e.target.value } : i))} 
                          className="h-10 rounded-xl border-slate-200"
                        />
                      }
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => mutation.mutate(items[idx])}
                      className="text-slate-300 hover:text-accent hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ... ProgramsTab and ProductsTab remain (I'll keep them short for brevity)
function ProgramsTab({ programs, isLoading }: any) {
  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden bg-white">
      <CardHeader className="flex flex-row justify-between items-center p-8 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Programs</CardTitle>
        <Button className="bg-accent text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-purple-100">
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/30 hover:bg-slate-50/30">
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Name</TableHead>
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">Duration</TableHead>
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6 text-right pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin h-6 w-6 text-slate-300 mx-auto" /></TableCell></TableRow>
            ) : programs?.map((p: any) => (
              <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                <TableCell className="pl-10 py-7 font-bold text-ink">{p.name}</TableCell>
                <TableCell className="text-slate-500 font-medium">{p.duration_days} Days</TableCell>
                <TableCell className="text-right pr-10"><Button variant="ghost" size="icon" className="rounded-lg text-slate-300 hover:text-accent"><Edit2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProductsTab({ products, isLoading }: any) {
  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden bg-white">
      <CardHeader className="flex flex-row justify-between items-center p-8 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Products</CardTitle>
        <Button className="bg-accent text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-purple-100">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/30 hover:bg-slate-50/30">
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Product</TableHead>
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">Code</TableHead>
              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6 text-right pr-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin h-6 w-6 text-slate-300 mx-auto" /></TableCell></TableRow>
            ) : products?.map((p: any) => (
              <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                <TableCell className="pl-10 py-7 font-bold text-ink">{p.name}</TableCell>
                <TableCell className="text-slate-500 font-medium">{p.code}</TableCell>
                <TableCell className="text-right pr-10"><Button variant="ghost" size="icon" className="rounded-lg text-slate-300 hover:text-accent"><Edit2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}