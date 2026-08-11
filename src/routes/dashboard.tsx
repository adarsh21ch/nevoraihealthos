import { createFileRoute, Outlet, useNavigate, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, TrendingUp, Settings, Building2, HelpCircle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "tenant_owner") throw redirect({ to: "/login" });
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate({ to: "/" });
  };

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard/" },
    { name: "Tenants", icon: Building2, path: "/admin" },
    { name: "Usage metrics", icon: TrendingUp, path: "/dashboard/metrics" },
    { name: "Platform config", icon: Settings, path: "/dashboard/config" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/50 bg-slate-900 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-900/20">H</div>
            <span className="font-bold text-lg tracking-tight text-white">Health OS</span>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800/50">
           <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all duration-200" onClick={handleSignOut}>
             <LogOut className="mr-3 h-4 w-4" />
             Sign Out
           </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-xl">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">TEAMNEVORAI@GMAIL.COM</div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><Bell className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><HelpCircle className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
