import { createFileRoute, Outlet, useNavigate, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, TrendingUp, Settings, Building2, HelpCircle, Bell, Package, MessageSquare, Layout, Key, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    // Safety check for primary admin email
    if (session.user.email === 'teamnevorai@gmail.com') {
      return { authContext: { role: 'platform_admin' } };
    }
    
    // Optimized check using a single RPC call
    const { data: context, error } = await supabase.rpc("get_my_auth_context");
    if (error || !context) {
      throw redirect({ to: "/login" });
    }

    const role = (context as any)?.role;
    const allowedRoles = ["tenant_owner", "platform_admin", "admin", "coach"];
    if (!allowedRoles.includes(role)) {
      throw redirect({ to: "/login" });
    }
    
    return { authContext: context };
  },

  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard/" },
    { name: "Customers", icon: Users, path: "/dashboard/customers/" },
    { name: "Products", icon: Package, path: "/dashboard/products" },
    { name: "Reorder", icon: TrendingUp, path: "/dashboard/reorder" },
    { name: "At-risk", icon: TrendingUp, path: "/dashboard/at-risk" },
    { name: "Access Control", icon: Key, path: "/dashboard/access" },
    { name: "Testimonials", icon: MessageSquare, path: "/dashboard/testimonials" },
    { name: "Invite", icon: Users, path: "/dashboard/invite" },
    { name: "BMI Leads", icon: Scale, path: "/dashboard/leads" },
    { name: "Settings", icon: Settings, path: "/dashboard/branding" },
  ];

  return (
    <div className="min-h-svh bg-surface text-ink flex flex-col lg:flex-row font-sans overflow-x-hidden">
      {/* Mobile Top Header for Dashboard */}
      <header className="lg:hidden h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full pt-safe">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">F</div>
          <span className="font-bold text-slate-900">Dashboard</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/login" });
          }}
          className="text-slate-400"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col shrink-0 h-svh sticky top-0">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-slate-200">F</div>
            <div>
               <span className="block font-bold text-lg tracking-tight text-slate-900 leading-none">Fat2Fit</span>
               <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Coach Portal</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 h-10 px-3 group rounded-xl"
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-bold tracking-tight">{item.name}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all h-10 px-3 rounded-xl" 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-bold tracking-tight text-xs uppercase tracking-widest">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav for Dashboard (Optional, but helps with app feel) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 flex justify-around items-center z-40 pb-safe">
        {navItems.slice(0, 4).map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 gap-1 text-[10px] text-slate-500"
            onClick={() => navigate({ to: item.path })}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Button>
        ))}
        <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 gap-1 text-[10px] text-slate-500"
            onClick={() => navigate({ to: "/dashboard/branding" })}
          >
            <Settings className="h-5 w-5" />
            <span>More</span>
        </Button>
      </nav>

      <div className="flex-1 flex flex-col bg-surface min-w-0">
        <header className="hidden lg:flex h-16 border-b border-slate-200 items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 tracking-wider uppercase">
               Dashboard
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full h-9 w-9"><Bell className="h-4 w-4" /></Button>
             <div className="w-px h-4 bg-slate-200 mx-1"></div>
             <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full h-9 w-9"><HelpCircle className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 pb-24 lg:pb-12 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}