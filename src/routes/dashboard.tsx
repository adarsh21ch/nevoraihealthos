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
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.15)]">H</div>
            <div>
               <span className="block font-bold text-lg tracking-tight text-white leading-none">Health OS</span>
               <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Platform Control</span>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-3">Main Navigation</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all duration-200 h-10 px-3 group"
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium tracking-tight">{item.name}</span>
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/50">
           <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 h-10 px-3" onClick={async () => {
             await supabase.auth.signOut();
             navigate({ to: "/login" });
           }}>
             <LogOut className="mr-3 h-4 w-4" />
             <span className="font-medium">Sign Out</span>
           </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-black">
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-mono text-zinc-600 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800 tracking-wider">SIGNED IN: TEAMNEVORAI@GMAIL.COM</div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full h-9 w-9"><Bell className="h-4 w-4" /></Button>
             <div className="w-px h-4 bg-zinc-800 mx-1"></div>
             <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full h-9 w-9"><HelpCircle className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
