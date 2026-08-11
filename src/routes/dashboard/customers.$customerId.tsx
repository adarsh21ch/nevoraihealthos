import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCustomerDetail, resetCustomerPassword } from "@/lib/dashboard.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageCircle, ArrowLeft, Calendar, TrendingUp, Camera, Ruler, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard/customers/$customerId")({
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const fetchDetail = useServerFn(getCustomerDetail);
  const resetPassword = useServerFn(resetCustomerPassword);

  const { data: customerData, isLoading, refetch } = useQuery({
    queryKey: ["customer-detail", customerId],
    queryFn: () => fetchDetail({ data: { customerId } }),
  });

  const customer = customerData as any;

  const resetMutation = useMutation({
    mutationFn: (id: string) => resetPassword({ data: { customerId: id } }),
    onSuccess: (data: any) => {
      toast.success(`Password reset! Temporary password: ${data.tempPassword}`, { duration: 10000 });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset password");
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!customer) return <div className="p-8 text-center">Customer not found</div>;

  const enrollment = customer.customer_enrollments?.[0];
  const program = enrollment?.programs;
  
  const weightData = customer.measurements
    ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((m: any) => ({
      date: format(new Date(m.created_at), "MMM d"),
      weight: m.weight
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/dashboard/customers"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
            <p className="text-slate-500 font-medium">Coach's monitoring view</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
            onClick={() => {
              const msg = `Hi ${customer.name}! Checking in on your progress with the ${program?.name || 'program'}. How are you feeling today?`;
              window.open(`https://wa.me/${(customer.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
            }}
          >
            <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
          </Button>
          <Button 
            variant="outline" 
            className="h-12 border-slate-200 text-slate-600 font-bold rounded-xl px-6"
            onClick={() => {
              if (confirm("Reset this customer's password to a temporary one?")) {
                resetMutation.mutate(customer.id);
              }
            }}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Key className="mr-2 h-4 w-4" />}
            Reset Password
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="bg-white border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="p-8 pb-0">
               <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Athlete Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-8 w-8" />
                </div>
                <div>
                   <p className="font-bold text-slate-900 text-xl">{customer.name}</p>
                   <p className="text-sm text-slate-500">{customer.phone}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 space-y-4">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Program</p>
                    <p className="font-bold text-slate-900">{program?.name || 'None'}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">Day {enrollment?.day_number || 0} / {program?.duration_days || 0}</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="journey" className="space-y-6">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
              <TabsTrigger value="journey" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="w-4 h-4 mr-2" /> Journey
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <TrendingUp className="w-4 h-4 mr-2" /> Stats
              </TabsTrigger>
              <TabsTrigger value="photos" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Camera className="w-4 h-4 mr-2" /> Photos
              </TabsTrigger>
              <TabsTrigger value="measurements" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Ruler className="w-4 h-4 mr-2" /> Measurements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="journey" className="space-y-6">
              <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                   <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Logs (Recent)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {customer.daily_logs?.sort((a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()).slice(0, 7).map((log: any) => (
                      <div key={log.id} className="p-6 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="font-bold text-slate-900">{format(new Date(log.logged_at), "EEEE, MMM d")}</p>
                            <p className="text-xs text-slate-500">Weight: {log.weight}kg · Energy: {log.energy}/10</p>
                         </div>
                         <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Adherence: {log.adherence_score}%
                         </div>
                      </div>
                    ))}
                    {(!customer.daily_logs || customer.daily_logs.length === 0) && (
                      <div className="p-12 text-center text-slate-400">No logs found</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm p-8">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Weight Transformation</h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="weight" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              {!customer.share_consent ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                  <Camera className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">Private Photos</p>
                  <p className="text-sm mt-1 max-w-xs">Athlete has not granted share consent. Photos are hidden to respect their privacy.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {customer.progress_photos?.map((photo: any) => (
                    <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={photo.photo_url} className="w-full h-full object-cover" loading="lazy" alt={photo.type} />
                    </div>
                  ))}
                  {(!customer.progress_photos || customer.progress_photos.length === 0) && (
                    <div className="col-span-full py-20 text-center text-slate-400">No photos uploaded</div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="measurements">
               <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardContent className="p-0">
                   <table className="w-full">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waist</th>
                          <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chest</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {customer.measurements?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((m: any) => (
                          <tr key={m.id}>
                            <td className="px-6 py-4 font-bold text-slate-900">{format(new Date(m.created_at), "MMM d, yyyy")}</td>
                            <td className="px-6 py-4 text-slate-600">{m.weight}kg</td>
                            <td className="px-6 py-4 text-slate-600">{m.waist}cm</td>
                            <td className="px-6 py-4 text-slate-600">{m.chest}cm</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
