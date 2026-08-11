import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCustomers } from "@/lib/dashboard.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, User, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const fetchCustomers = useServerFn(getCustomers);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-customers", page, search],
    queryFn: () => fetchCustomers({ data: { page, search } }),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and monitor your athlete performance.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search name or phone..." 
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      <Card className="bg-white border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-8 h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Athlete</TableHead>
                <TableHead className="h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Program</TableHead>
                <TableHead className="h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</TableHead>
                <TableHead className="h-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</TableHead>
                <TableHead className="pr-8 h-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-slate-50">
                    <TableCell colSpan={5} className="h-20 bg-slate-50/20"></TableCell>
                  </TableRow>
                ))
              ) : data?.customers?.map((customer: any) => {
                const enrollment = customer.customer_enrollments?.[0];
                const program = enrollment?.programs;
                const dayNumber = enrollment?.day_number || 0;
                const duration = program?.duration_days || 0;

                return (
                  <TableRow key={customer.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <Link 
                        to={`/dashboard/customers/${customer.id}` as any}
                        className="flex items-center gap-3 group/link"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/link:bg-slate-200 transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-900 group-hover/link:text-slate-600 transition-colors">{customer.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-5 font-medium text-slate-600">{program?.name || "No active program"}</TableCell>
                    <TableCell className="py-5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Day {dayNumber} of {duration}</span>
                          <span>{duration ? Math.round((dayNumber / duration) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (dayNumber / duration) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 font-mono text-xs text-slate-500">{customer.phone}</TableCell>
                    <TableCell className="pr-8 py-5 text-right">
                      <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 h-9 px-4">
                        <Link to={`/dashboard/customers/${customer.id}` as any}>
                          Details <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && data?.customers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search className="h-8 w-8 mb-2" />
                      <p className="font-bold">No customers found</p>
                      <p className="text-xs">Try adjusting your search filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {data?.customers?.length || 0} of {data?.total || 0} athletes
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest"
                disabled={!data || (page + 1) * 25 >= data.total}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
