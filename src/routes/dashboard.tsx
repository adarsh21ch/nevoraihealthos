import { createFileRoute, Outlet, useNavigate, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, TrendingUp, Settings, Building2, HelpCircle, Bell, Package, MessageSquare, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    
    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "tenant_owner") {
      toast.error("Access denied: Tenant Owner only");
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Customers", icon: Users, path: "/dashboard/customers" },
    { name: "Reorder", icon: Package, path: "/dashboard/reorder" },
    { name: "At-risk", icon: TrendingUp, path: "/dashboard/at-risk" },
    { name: "Testimonials", icon: MessageSquare, path: "/dashboard/testimonials" },
    { name: "Invite", icon: Users, path: "/dashboard/invite" },
    { name: "Branding", icon: Layout, path: "/dashboard/branding" },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#0F172A] flex font-sans">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-slate-200">H</div>
            <div>
               <span className="block font-bold text-lg tracking-tight text-slate-900 leading-none">Health OS</span>
               <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Owner Portal</span>
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

      <div className="flex-1 flex flex-col bg-[#FCFBF8]">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
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

        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}