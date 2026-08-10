import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, Users, TrendingUp, Package, BookOpen } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPlaceholder,
});

function DashboardPlaceholder() {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="font-bold text-xl tracking-tight">Health OS</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-xl border shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <Users className="text-muted-foreground h-5 w-5" />
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">+12%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <h3 className="text-2xl font-bold">128</h3>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <TrendingUp className="text-muted-foreground h-5 w-5" />
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">High</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adherence Rate</p>
              <h3 className="text-2xl font-bold">92%</h3>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <Package className="text-muted-foreground h-5 w-5" />
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">3 Due</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reorders</p>
              <h3 className="text-2xl font-bold">14</h3>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <BookOpen className="text-muted-foreground h-5 w-5" />
              <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded">Active</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Program</p>
              <h3 className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">Clean 9 Express</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">Distributor Dashboard Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We are currently building Phase 6: The Distributor Dashboard. 
            Soon you will be able to manage your customers, track their progress, and handle reorders from this screen.
          </p>
          <div className="pt-4">
            <Button disabled variant="outline">Learn More about Phase 6</Button>
          </div>
        </div>
      </main>
    </div>
  );
}