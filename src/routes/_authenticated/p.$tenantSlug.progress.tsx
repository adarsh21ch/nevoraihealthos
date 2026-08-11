import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMeasurements, addMeasurement } from '@/lib/measurements/measurements.functions';
import { getTodayData } from '@/lib/today.functions';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Plus, TrendingDown, Scale, Ruler, 
  ChevronRight, Camera, Info, Loader2,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/progress')({
  component: ProgressPage,
});

function ProgressPage() {
  const { tenantSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const getMeasurementsFn = useServerFn(getMeasurements);
  const addMeasurementFn = useServerFn(addMeasurement);
  const getTodayFn = useServerFn(getTodayData);

  const [activeTab, setActiveTab] = useState<'weight' | 'measurements'>('weight');
  const [measurementType, setMeasurementType] = useState<string>('waist_cm');
  const [isAdding, setIsAdding] = useState(false);

  const { data: todayData } = useQuery({
    queryKey: ['today', tenantSlug],
    queryFn: () => getTodayFn({ data: { tenantSlug } }),
  });

  const customerId = todayData && !('redirect' in todayData) ? todayData.customer?.id : null;

  const { data: result, isLoading } = useQuery({
    queryKey: ['measurements', customerId],
    queryFn: () => getMeasurementsFn({ data: { customerId: customerId! } }),
    enabled: !!customerId,
  });

  const measurements = result?.data || [];

  const addMutation = useMutation({
    mutationFn: (data: any) => addMeasurementFn({ data: { ...data, customerId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      setIsAdding(false);
      toast.success("Measurement saved");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your progress...</div>;

  const latest = measurements[measurements.length - 1];
  const earliest = measurements[0];
  
  const weightLoss = (earliest?.weight_kg && latest?.weight_kg) 
    ? (earliest.weight_kg - latest.weight_kg).toFixed(1) 
    : 0;
  
  const waistLoss = (earliest?.waist_cm && latest?.waist_cm) 
    ? (earliest.waist_cm - latest.waist_cm).toFixed(1) 
    : 0;

  const chartData = measurements.map(m => ({
    date: format(new Date(m.taken_on || m.created_at!), 'MMM d'),
    weight: m.weight_kg,
    waist: m.waist_cm,
    hip: m.hip_cm,
    chest: m.chest_cm,
    thigh: m.thigh_cm,
    arm: m.arm_cm,
  }));

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Progress</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold accent-text accent-bg-soft px-2 py-1 rounded-full uppercase tracking-widest">
              Live Transformation
            </span>
          </div>
        </div>
        <Sheet open={isAdding} onOpenChange={setIsAdding}>
          <SheetTrigger asChild>
            <Button className="w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-90 transition-all p-0">
              <Plus className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[2.5rem] p-8 pb-12 outline-none">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-bold">Add Log</SheetTitle>
            </SheetHeader>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addMutation.mutate({
                weight_kg: Number(formData.get('weight')),
                waist_cm: Number(formData.get('waist')),
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weight (kg)</Label>
                  <Input name="weight" type="number" step="0.1" placeholder="75.0" className="h-14 rounded-2xl text-lg font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waist (cm)</Label>
                  <Input name="waist" type="number" step="0.1" placeholder="85.0" className="h-14 rounded-2xl text-lg font-bold" />
                </div>
              </div>
              <Button type="submit" disabled={addMutation.isPending} className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                {addMutation.isPending ? <Loader2 className="animate-spin" /> : "Save Entry"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="bg-ink rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <ArrowDownRight className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weight Loss</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">-{weightLoss}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Ruler className="w-5 h-5 text-slate-400" />
            </div>
            <TrendingDown className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Waist Loss</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">-{waistLoss}</span>
              <span className="text-xs font-bold text-slate-400">cm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="weight" onValueChange={(v) => setActiveTab(v as any)}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Trends</h3>
            <TabsList className="bg-slate-100 rounded-full h-8 p-1">
              <TabsTrigger value="weight" className="rounded-full text-[10px] font-bold px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">WEIGHT</TabsTrigger>
              <TabsTrigger value="measurements" className="rounded-full text-[10px] font-bold px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">CMs</TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 h-64 shadow-sm">
            {chartData.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Info className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add more logs to see charts</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTab === 'weight' ? '#0f172a' : '#3b82f6'} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={activeTab === 'weight' ? '#0f172a' : '#3b82f6'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeTab === 'weight' ? 'weight' : 'waist'} 
                    stroke={activeTab === 'weight' ? 'var(--color-ink)' : 'var(--accent, #3b82f6)'} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Tabs>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900">Transformations</h3>
          <button className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
            VIEW ALL <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-[2rem] bg-slate-200 overflow-hidden flex items-center justify-center relative">
               <Camera className="w-6 h-6 text-slate-400" />
               <span className="absolute bottom-4 left-4 text-[8px] font-bold uppercase tracking-widest text-slate-400 bg-white/80 px-2 py-1 rounded-lg">Day 0</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Baseline</p>
          </div>
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-[2rem] bg-slate-200 overflow-hidden flex items-center justify-center relative">
               <Camera className="w-6 h-6 text-slate-400" />
               <span className="absolute bottom-4 left-4 text-[8px] font-bold uppercase tracking-widest text-slate-900 bg-white/80 px-2 py-1 rounded-lg">Latest</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Current</p>
          </div>
        </div>
      </div>
    </div>
  );
}
