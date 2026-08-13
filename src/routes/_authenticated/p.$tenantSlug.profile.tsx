import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { 
  User, 
  Ruler, 
  Target, 
  Info, 
  Utensils, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Package,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile, validateProfileReadiness } from '@/lib/profile/profile.functions';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/profile')({
  component: ProfilePage,
});


function ProfilePage() {
  const { tenantSlug } = Route.useParams();
  const getProfile = useServerFn(getMyProfile);
  const checkReadiness = useServerFn(validateProfileReadiness);
  
  const [activeSection, setActiveSection] = React.useState<any>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getProfile(),
  });

  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['profile-readiness'],
    queryFn: () => checkReadiness(),
  });


  if (isProfileLoading || isReadinessLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) return <div>Profile not found</div>;

  const percent = readiness?.percent || 0;
  const isComplete = readiness?.ready;

  const sections = [
    { 
      id: 'personal',
      title: 'Personal', 
      icon: User, 
      fields: [
        { label: 'Name', value: profile.name, key: 'name' },
        { label: 'DOB', value: profile.dob, key: 'dob', type: 'date' },
        { label: 'Sex', value: profile.gender, key: 'gender', options: ['Male', 'Female', 'Other'] }
      ]
    },
    { 
      id: 'body',
      title: 'Body', 
      icon: Ruler, 
      fields: [
        { label: 'Height (cm)', value: profile.height_cm ? `${profile.height_cm} cm` : null, key: 'height_cm', type: 'number' },
        { label: 'Weight (kg)', value: profile.weight_kg ? `${profile.weight_kg} kg` : null, key: 'weight_kg', type: 'number' },
        { label: 'Waist (cm)', value: profile.waist_cm ? `${profile.waist_cm} cm` : null, key: 'waist_cm', type: 'number' }
      ]
    },
    { 
      id: 'goals',
      title: 'Goals', 
      icon: Target, 
      fields: [
        { label: 'Primary Goal', value: profile.goal, key: 'goal', options: ['Weight Loss', 'Weight Management', 'Body Composition', 'Energy & Habits'] },
        { label: 'Target Weight (kg)', value: profile.target_weight_kg ? `${profile.target_weight_kg} kg` : null, key: 'target_weight_kg', type: 'number' }
      ]
    },
    { 
      id: 'lifestyle',
      title: 'Lifestyle', 
      icon: Info, 
      fields: [
        { label: 'Activity Level', value: profile.activity_level, key: 'activity_level', options: ['sedentary', 'light', 'moderate', 'very'] },
        { label: 'Lifestyle', value: profile.lifestyle, key: 'lifestyle', options: ['Office Worker', 'Business Owner', 'Student', 'Homemaker', 'Shift Worker', 'Retired'] }
      ]
    },
    { 
      id: 'diet',
      title: 'Diet', 
      icon: Utensils, 
      fields: [
        { label: 'Diet Preference', value: profile.diet_preference, key: 'diet_preference', options: ['Vegetarian', 'Non-Vegetarian', 'Egg-Inclusive', 'Vegan'] },
        { label: 'Cooking Access', value: profile.cooking_access, key: 'cooking_access', options: ['Full Kitchen', 'Basic Access', 'Limited (Hostel/Office)', 'No Cooking'] }
      ]
    },
    { 
      id: 'health',
      title: 'Safety / Health', 
      icon: ShieldCheck, 
      fields: [
        { label: 'Allergies (comma separated)', value: profile.allergies?.join(', '), key: 'allergies' },
        { label: 'Health Concerns', value: profile.health_concerns, key: 'health_concerns', type: 'textarea' }
      ]
    }
  ];



  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Your Profile</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Health & Program Status</p>
      </header>

      {/* Profile Hub Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-health-green flex items-center justify-center text-3xl font-black shadow-inner">
                {profile.name?.charAt(0) || 'U'}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-ink italic font-serif leading-tight">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{profile.track || 'C9'} PROGRAM</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-health-green">Active</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em]",
              isComplete ? "text-health-green" : "text-slate-400"
            )}>
              {isComplete ? 'Profile Complete' : `${percent}% Complete`}
            </span>
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-health-green" />
            ) : (
              <span className="text-[10px] font-bold text-slate-400 italic">Remaining: {readiness?.missing.length}</span>
            )}
          </div>
          <Progress value={percent} className="h-2 bg-slate-50" />
          {!isComplete && (
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-900/70 leading-relaxed">
                  Complete your profile to unlock your personalized AI nutrition plan.
                </p>
                <Button variant="link" asChild className="h-auto p-0 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                  <Link to="/onboarding" className="contents">Complete Profile</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Progress Quick-view */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-health-green" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Progress</span>
          </div>
          <Button variant="link" className="text-white/60 hover:text-white p-0 h-auto text-[9px] font-black uppercase tracking-widest">
            View History
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Weight</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif italic">{profile.weight_kg || '--'}</span>
              <span className="text-[10px] font-bold text-slate-500">KG</span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target</span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-2xl font-bold font-serif italic">{profile.target_weight_kg || '--'}</span>
              <span className="text-[10px] font-bold text-slate-500">KG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Information (Moved from Guide) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Program Guidance</h3>
        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/p/$tenantSlug/kit" 
            params={{ tenantSlug }}
            className="w-full flex items-center justify-between bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Program Overview</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Understanding the 9-Day Reset</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
          </Link>
          
          <button 
            onClick={() => setActiveSection(sections.find(s => s.id === 'goals'))}
            className="w-full flex items-center justify-between bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Goal Setting</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Setting your reset intentions</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
          </button>
        </div>
      </div>

      {/* Editable Sections */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Health Profile</h3>
        <div className="space-y-6">
            {sections.map(section => (
                <div key={section.title} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-health-green transition-colors">
                                  <section.icon className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-ink text-lg italic font-serif tracking-tight">{section.title}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            onClick={() => setActiveSection(section)}
                            className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-health-green hover:bg-emerald-50/50"
                          >
                            Edit
                          </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pl-1">
                        {section.fields.map(field => (
                          <div key={field.label} className="flex justify-between items-center py-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                            <span className="text-sm font-bold text-ink">{field.value || 'Not set'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <ProfileEditDrawer 
        isOpen={!!activeSection} 
        onClose={() => setActiveSection(null)} 
        section={activeSection} 
        profile={profile}
      />
    </div>
  );
}

