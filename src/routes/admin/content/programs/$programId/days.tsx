import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProgramDays, saveProgramDay, saveDayTask, deleteDayTask, getAdminProducts } from "@/lib/admin-content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, ChevronLeft, Clock } from "lucide-react";

import { checkAdminStatus, getUserRole } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content/programs/$programId/days")({
  beforeLoad: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw redirect({ to: "/login" });
      }

      const { data: context } = await supabase.rpc("get_my_auth_context");
      const role = (context as any)?.role;
      if (role !== "platform_admin") {
        if (role === "owner" || role === "staff") {
          throw redirect({ to: "/dashboard" });
        }
        throw redirect({ to: "/" });
      }
    } catch (e) {
      if ((e as any).status === 307 || (e as any).status === 302) throw e;
      throw redirect({ to: "/login" });
    }
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-days", programId] });
      toast.success("Day updated");
    }
  });

  const taskMutation = useMutation({
    mutationFn: (data: any) => saveTaskFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-days", programId] });
      toast.success("Task saved");
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTaskFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-days", programId] });
      toast.success("Task deleted");
    }
  });

  if (loadingDays) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  const activeDay = days?.find(d => d.id === activeDayId) || days?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/content"><ChevronLeft className="h-4 w-4 mr-2" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Program Day Builder</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar: Day List */}
        <div className="col-span-3 space-y-2">
          <p className="text-xs font-bold uppercase text-muted-foreground px-2">Program Days</p>
          <div className="space-y-1">
            {days?.map(day => (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeDay?.id === day.id ? "bg-[#16a34a] text-white shadow-sm" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                Day {day.day_number}: {day.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Day Editor */}
        <div className="col-span-9 space-y-6">
          {activeDay ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Day {activeDay.day_number} Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Title</label>
                      <Input 
                        defaultValue={activeDay.title} 
                        onBlur={(e) => dayMutation.mutate({ ...activeDay, title: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Focus</label>
                      <Input 
                        defaultValue={activeDay.focus || ""} 
                        onBlur={(e) => dayMutation.mutate({ ...activeDay, focus: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Motivation</label>
                    <Textarea 
                      defaultValue={activeDay.motivation || ""} 
                      onBlur={(e) => dayMutation.mutate({ ...activeDay, motivation: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Meal Guidance</label>
                    <Textarea 
                      defaultValue={activeDay.meal_guidance || ""} 
                      onBlur={(e) => dayMutation.mutate({ ...activeDay, meal_guidance: e.target.value })} 
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Day Tasks</h3>
                  <Button size="sm" onClick={() => taskMutation.mutate({ 
                    program_day_id: activeDay.id, 
                    title: "New Task", 
                    time_slot: "morning",
                    sort_order: activeDay.day_tasks.length 
                  })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeDay.day_tasks?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((task: any) => (
                    <Card key={task.id} className="border-slate-200">
                      <CardContent className="p-4 grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase">Slot</label>
                          <Select 
                            defaultValue={task.time_slot} 
                            onValueChange={(v) => taskMutation.mutate({ ...task, time_slot: v })}
                          >
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["morning", "pre_lunch", "lunch", "evening", "pre_dinner", "dinner", "bedtime", "anytime"].map(s => (
                                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3 space-y-2">
                          <label className="text-[10px] font-bold uppercase">Product</label>
                          <Select 
                            defaultValue={task.product_id || "none"} 
                            onValueChange={(v) => taskMutation.mutate({ ...task, product_id: v === "none" ? null : v })}
                          >
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Product</SelectItem>
                              {products?.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4 space-y-2">
                          <label className="text-[10px] font-bold uppercase">Task Title / Dosage</label>
                          <Input 
                            className="h-9" 
                            defaultValue={task.title} 
                            onBlur={(e) => taskMutation.mutate({ ...task, title: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase">Time</label>
                          <Input 
                            type="time" 
                            className="h-9" 
                            defaultValue={task.suggested_time?.substring(0, 5)} 
                            onBlur={(e) => taskMutation.mutate({ ...task, suggested_time: e.target.value })}
                          />
                        </div>
                        <div className="col-span-1 flex justify-end pb-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 h-9 w-9" 
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeDay.day_tasks?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                      No tasks for this day.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-400">Select a day to start building</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
