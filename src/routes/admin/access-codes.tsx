import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessCodes, generateAccessCode, deleteAccessCode } from "@/lib/access-codes.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Key } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/access-codes")({
  component: AdminAccessCodes,
});

function AdminAccessCodes() {
  const queryClient = useQueryClient();
  const [newCode, setNewCode] = useState("");
  
  const getCodesFn = useServerFn(getAccessCodes);
  const generateCodeFn = useServerFn(generateAccessCode);
  const deleteCodeFn = useServerFn(deleteAccessCode);

  const { data: codes, isLoading } = useQuery({
    queryKey: ["admin-access-codes"],
    queryFn: () => getCodesFn(),
  });

  const generateMutation = useMutation({
    mutationFn: (code: string) => generateCodeFn({ data: { code } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-codes"] });
      setNewCode("");
      toast.success("Access code generated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCodeFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-access-codes"] });
      toast.success("Access code deleted");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    generateMutation.mutate(newCode);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-ink leading-none font-serif italic">Access Codes</h1>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Manage keys for new participant enrollment.</p>
        </div>
      </div>

      <Card className="border-slate-200 rounded-[2rem] shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Generate New Code</CardTitle>
          <form onSubmit={handleGenerate} className="flex gap-4 mt-4">
            <Input 
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="E.g. SUMMER2026"
              className="h-12 px-6 rounded-xl border-slate-200 max-w-xs font-bold tracking-widest"
            />
            <Button 
              type="submit" 
              disabled={generateMutation.isPending}
              className="bg-accent text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-purple-100"
            >
              {generateMutation.isPending ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/30 hover:bg-slate-50/30">
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Code</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">Status</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">Created</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6 text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300 mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && codes?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    No access codes found
                  </TableCell>
                </TableRow>
              )}
              {codes?.map((code: any) => (
                <TableRow key={code.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                  <TableCell className="pl-10 py-7">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Key className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-bold text-ink tracking-widest">{code.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.used_at ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                        Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600">
                        Available
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm font-medium">
                    {new Date(code.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMutation.mutate(code.id)}
                      disabled={deleteMutation.isPending}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
