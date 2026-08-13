import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Users, Settings, LogOut, FileText, Database, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
    
    const { data: context } = await supabase.rpc("get_my_auth_context");
    if ((context as any)?.role !== "platform_admin") {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '128', icon: Users },
    { label: 'Active Programs', value: '84', icon: Activity },
    { label: 'System Health', value: 'Good', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 space-y-8 flex flex-col">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold">F</div>
            <span className="font-bold text-lg tracking-tight">Admin OS</span>
        </div>
        
        <nav className="flex-1 space-y-2">
            <NavItem icon={LayoutDashboard} label="Overview" active />
            <NavItem icon={Users} label="Users" />
            <NavItem icon={FileText} label="Programs" />
            <NavItem icon={Settings} label="Settings" />
        </nav>

        <Button variant="ghost" className="text-slate-400 hover:text-white justify-start gap-3 px-2">
            <LogOut className="w-5 h-5" />
            Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-10 max-w-6xl mx-auto w-full">
        <header>
            <h1 className="text-3xl font-bold text-ink tracking-tight italic font-serif">Platform Management</h1>
            <p className="text-slate-500 font-medium mt-1">Global oversight and configuration</p>
        </header>

        <div className="grid grid-cols-3 gap-6">
            {stats.map(stat => (
                <Card key={stat.label} className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 pb-2">
                        <div className="flex justify-between items-center">
                            <stat.icon className="w-5 h-5 text-slate-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-bold text-ink italic font-serif">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-ink text-lg">System Logs</h3>
                <Button variant="outline" className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest">Download CSV</Button>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div className="flex gap-4 items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div>
                                <div className="text-sm font-bold text-ink">New Program Invocation</div>
                                <div className="text-[10px] text-slate-400 font-medium">10 mins ago • User ID #429</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Details</Button>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: any) {
    return (
        <button className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm",
            active ? "bg-accent text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}
