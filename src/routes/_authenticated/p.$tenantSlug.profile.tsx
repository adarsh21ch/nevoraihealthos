import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { User, Ruler, Target, Info, Utensils, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile } from '@/lib/profile/profile.functions';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const getProfile = useServerFn(getMyProfile);
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getProfile(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Profile</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manage your health information</p>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center text-xl font-black">
                {profile.name?.charAt(0) || 'U'}
            </div>
            <div>
                <h2 className="text-xl font-bold text-ink italic font-serif">{profile.name}</h2>
                <p className="text-sm text-slate-500 font-medium">C9 Program</p>
            </div>
        </div>
        <div className="bg-emerald-50 rounded-[1.5rem] p-4 flex items-center justify-between">
            <span className="text-emerald-800 text-sm font-bold">Profile 82% Complete</span>
            <Button size="sm" className="rounded-xl bg-emerald-600">Complete</Button>
        </div>
      </div>

      <div className="space-y-6">
          {[
              { title: 'Personal', icon: User },
              { title: 'Body', icon: Ruler },
              { title: 'Goals', icon: Target },
              { title: 'Lifestyle', icon: Info },
              { title: 'Diet', icon: Utensils },
              { title: 'Safety / Health', icon: ShieldCheck }
          ].map(section => (
              <button key={section.title} className="w-full flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                          <section.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-ink">{section.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-accent transition-all" />
              </button>
          ))}
      </div>
    </div>
  );
}
