import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers } from "@/lib/dashboard.functions";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/tenants/")({
  component: AdminTenants,
});

function AdminTenants() {
  const queryClient = useQueryClient();
  const getCustomersFn = useServerFn(getCustomers);

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => getCustomersFn({ data: { page: 0 } }),
  });

  const customers = result?.customers || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">Customers</h1>
        <p className="text-slate-500 mt-4 font-medium text-lg max-w-md">Global customer list for Fat2Fit.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-10 py-6">Customer</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Phone</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Program</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] py-6">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-slate-100">
                <TableCell colSpan={4} className="py-16 text-center">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && customers.length === 0 && (
              <TableRow className="border-slate-100">
                <TableCell colSpan={4} className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No customers yet
                </TableCell>
              </TableRow>
            )}
            {customers.map((c: any) => (
              <TableRow key={c.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                <TableCell className="pl-10 py-7 font-bold text-ink">{c.name}</TableCell>
                <TableCell className="text-slate-500">{c.phone}</TableCell>
                <TableCell className="text-slate-500">{c.program?.name || 'N/A'}</TableCell>
                <TableCell className="text-slate-500">{new Date(c.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}