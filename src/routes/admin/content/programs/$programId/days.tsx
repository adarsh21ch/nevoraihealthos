import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProgramDays, saveProgramDay, saveDayTask, deleteDayTask, duplicateProgramDay, getAdminProducts } from "@/lib/admin-content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronLeft, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content/programs/$programId/days")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "platform_admin") throw redirect({ to: "/" });
  },
  component: DayBuilder,
});

function DayBuilder() {
  const { programId } = Route.useParams();
  const queryClient = useQueryClient();
  const getDaysFn = useServerFn(getProgramDays);
  const getProductsFn = useServerFn(getAdminProducts);
  const saveDayFn = useServerFn(saveProgramDay);
  const saveTaskFn = useServerFn(saveDayTask);
  const deleteTaskFn = useServerFn(deleteDayTask);
  const duplicateDayFn = useServerFn(duplicateProgramDay);

  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  const { data: days, isLoading: loadingDays } = useQuery({
    queryKey: ["program-days", programId],
    queryFn: () => getDaysFn({ data: { programId } }),
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProductsFn(),
  });

  const dayMutation = useMutation({
    mutationFn: (data: any) => saveDayFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["program-days", programId] })
  });

  const taskMutation = useMutation({
    mutationFn: (data: any) => saveTaskFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["program-days", programId] })
  });

  const duplicateMutation = useMutation({
    mutationFn: (data: any) => duplicateDayFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-days", programId] });
      toast.success("Tasks copied");
    }
  });

  if (loadingDays) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  const activeDay = days?.find(d => d.id === activeDayId) || days?.[0];

  const completedDaysCount = days?.filter(d => d.title && d.day_tasks?.length > 0).length || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/content"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Program Builder</h1>
        </div>
        <div className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-full">
          {completedDaysCount} / {days?.length} Days Completed
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 space-y-2">
          {days?.map(day => (
            <button
              key={day.id}
              onClick={() => setActiveDayId(day.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${activeDay?.id === day.id ? "bg-[#16a34a] text-white" : "bg-white hover:bg-slate-50"}`}
            >
              Day {day.day_number}: {day.title || "Untitled"}
            </button>
          ))}
        </div>

        <div className="col-span-9 space-y-6">
          {activeDay && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Editing Day {activeDay.day_number}</h2>
                <Button size="sm" variant="outline" onClick={() => {
                  const prevDay = days?.find(d => d.day_number === activeDay.day_number - 1);
                  if (prevDay) duplicateMutation.mutate({ fromDayId: prevDay.id, toDayId: activeDay.id });
                }}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Tasks from Previous
                </Button>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <Input defaultValue={activeDay.title} placeholder="Title" onBlur={(e) => dayMutation.mutate({ ...activeDay, title: e.target.value })} />
                  <Input defaultValue={activeDay.focus || ""} placeholder="Focus" onBlur={(e) => dayMutation.mutate({ ...activeDay, focus: e.target.value })} />
                  <Textarea defaultValue={activeDay.motivation || ""} placeholder="Motivation" onBlur={(e) => dayMutation.mutate({ ...activeDay, motivation: e.target.value })} />
                </CardContent>
              </Card>

              <div className="space-y-4">
                {activeDay.day_tasks?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((task: any) => (
                  <div key={task.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm">
                    <Select defaultValue={task.time_slot} onValueChange={(v) => taskMutation.mutate({ ...task, time_slot: v })}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["morning", "lunch", "dinner", "anytime"].map(s => <SelectItem value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input className="flex-1" defaultValue={task.title} onBlur={(e) => taskMutation.mutate({ ...task, title: e.target.value })} />
                    <Button variant="ghost" size="icon" onClick={() => deleteTaskFn({ data: { id: task.id } }).then(() => queryClient.invalidateQueries({ queryKey: ["program-days", programId] }))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => taskMutation.mutate({ program_day_id: activeDay.id, title: "New Task", time_slot: "morning", sort_order: activeDay.day_tasks.length })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}