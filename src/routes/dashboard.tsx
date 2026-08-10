import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, TrendingUp, Settings, Building2, HelpCircle, Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
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
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">H</div>
            <span className="font-bold text-xl tracking-tight">Health OS</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
           <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" onClick={handleSignOut}>
             <LogOut className="mr-3 h-4 w-4" />
             Sign Out
           </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur">
          <div className="text-sm text-slate-400">TEAMNEVORAI@GMAIL.COM</div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
             <Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5" /></Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
