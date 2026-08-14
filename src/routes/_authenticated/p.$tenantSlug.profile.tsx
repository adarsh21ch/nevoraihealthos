import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  BookOpen,
  Download,
  Key,
  Languages,
  RefreshCcw,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Weight,
  Zap,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import defaultBookletAsset from "@/assets/landing/c9-booklet.pdf.asset.json";
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { getMyProfile, validateProfileReadiness, resetParticipantDay } from '@/lib/profile/profile.functions';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/profile')({
  component: ProfilePage,
});



function ResetDayButton() {
  const resetFn = useServerFn(resetParticipantDay);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetFn();
      toast.success("Journey reset to Day 1!");
      queryClient.invalidateQueries();
      // Use window.location to force a clean state after reset
      window.location.href = window.location.pathname.replace('/profile', '/today');
    } catch (error: any) {
      toast.error(error.message || "Failed to reset journey");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-16 rounded-2xl border-red-100 bg-red-50/30 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCcw className="w-5 h-5" />
          Reset Journey to Day 1
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2.5rem] p-8 bg-white border-none shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <AlertDialogTitle className="text-2xl font-serif italic font-bold text-center text-ink">Reset Your Progress?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-center text-base leading-relaxed">
            This will set your program start date to today. Your task history for previous days will remain, but your timeline will restart from Day 1.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
          <AlertDialogCancel className="flex-1 h-14 rounded-xl border-slate-100 font-bold text-slate-400">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={isResetting}
            className="flex-1 h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            {isResetting ? "Resetting..." : "Yes, Reset Day 1"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProfilePage() {
  const { tenantSlug } = Route.useParams();
  const { tenant } = useLoaderData({ from: '/_authenticated/p/$tenantSlug' }) as any;
  const bookletUrl = tenant?.booklet_url || defaultBookletAsset.url;
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
        { 
          label: 'Sex', 
          value: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : null, 
          key: 'gender', 
          options: ['Male', 'Female', 'Other'] 
        }
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
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: Languages,
      fields: [
        { label: 'AI Response Language', value: profile.preferred_language, key: 'preferred_language', options: ['English', 'Hindi'] }
      ]
    }
  ];



  return (
    <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 pt-16 pb-32 animate-in fade-in duration-700 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-ink tracking-tighter italic font-serif leading-none">Your Profile</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-4 ml-1">Health & Program Status</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Protocol Version</p>
            <p className="text-sm font-bold text-ink">C9 Reset v1.2</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Profile Hub Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10 flex flex-col justify-center">
          <div className="flex items-center gap-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2.5rem] bg-emerald-50 text-health-green flex items-center justify-center text-4xl lg:text-5xl font-black shadow-inner">
                  {profile.name?.charAt(0) || 'U'}
              </div>
              <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-ink italic font-serif leading-tight">{profile.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{profile.track || 'C9'} PROTOCOL</span>
                    <div className="w-2 h-2 rounded-full bg-health-green" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-health-green">Active Enrollment</span>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[11px] font-black uppercase tracking-[0.3em]",
                isComplete ? "text-health-green" : "text-slate-400"
              )}>
                {isComplete ? 'Profile Complete' : `Onboarding Progress: ${percent}%`}
              </span>
              {isComplete ? (
                <CheckCircle2 className="w-6 h-6 text-health-green" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 italic">Remaining: {readiness?.missing.length}</span>
              )}
            </div>
            <Progress value={percent} className="h-3 bg-slate-50" />
            {!isComplete && (
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-sm font-bold text-emerald-900/70 leading-relaxed">
                    Complete your profile to unlock your personalized AI nutrition plan and full metabolic insights.
                  </p>
                  <Button variant="link" asChild className="h-auto p-0 text-emerald-600 font-black text-[11px] uppercase tracking-widest">
                    <Link to="/onboarding" className="contents">Finish Profile Setup <ChevronRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Measurement Progress Quick-view */}
        <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-12 text-white space-y-10 shadow-2xl shadow-slate-200 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <TrendingUp className="w-64 h-64 text-white" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-health-green" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Target Analytics</span>
            </div>
            <Button variant="link" className="text-white/60 hover:text-white p-0 h-auto text-[11px] font-black uppercase tracking-widest">
              Full History
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-12 relative z-10">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Weight</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl lg:text-6xl font-bold font-serif italic">{profile.weight_kg || '--'}</span>
                <span className="text-xs font-black text-slate-500 uppercase">KG</span>
              </div>
            </div>
            <div className="space-y-3 text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Goal</span>
              <div className="flex items-baseline gap-3 justify-end">
                <span className="text-5xl lg:text-6xl font-bold font-serif italic text-health-green">{profile.target_weight_kg || '--'}</span>
                <span className="text-xs font-black text-slate-500 uppercase">KG</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Metabolic Status</span>
            <span className="text-[11px] font-black text-health-green uppercase tracking-[0.2em]">Reset Optimized</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Program Guidance */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Program Resources</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              to="/p/$tenantSlug/kit" 
              params={{ tenantSlug }}
              className="w-full flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-500"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-ink group-hover:text-health-green transition-colors">Program Overview</h4>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">View Reset Kit & Guides</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-health-green transition-all" />
            </Link>
            
            <button 
              onClick={() => setActiveSection(sections.find(s => s.id === 'body'))}
              className="w-full flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-500"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-ink group-hover:text-health-green transition-colors">Update Body Metrics</h4>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">Weight, waist, and target goals</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-health-green transition-all" />
            </button>

            <a 
              href={bookletUrl}

              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between bg-emerald-600 p-8 rounded-[2.5rem] border border-emerald-500 shadow-lg shadow-emerald-900/10 group hover:bg-emerald-700 transition-all duration-500"
            >
              <div className="flex items-center gap-6 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Download className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold">Protocol Guide 2026</h4>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-100/60 mt-1">View official guide</p>
                </div>
              </div>
              <Download className="w-6 h-6 text-white/40 group-hover:text-white transition-all" />
            </a>

            <button 
              onClick={() => setActiveSection({
                id: 'security',
                title: 'Security',
                icon: Key,
                fields: [
                  { label: 'New Password', key: 'password', type: 'password' },
                  { label: 'Confirm Password', key: 'confirm_password', type: 'password' }
                ]
              })}
              className="w-full flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-500"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Key className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-ink group-hover:text-health-green transition-colors">Security & Access</h4>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">Change your account password</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-health-green transition-all" />
            </button>
          </div>
        </div>

        {/* Health Profile */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Core Health Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.slice(0, 5).map(section => (
                  <div key={section.title} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group p-8 space-y-6 hover:border-health-green/20 transition-all duration-500">
                      <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-health-green transition-colors">
                              <section.icon className="w-6 h-6" />
                          </div>
                          <Button 
                            variant="ghost" 
                            onClick={() => setActiveSection(section)}
                            className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-health-green hover:bg-emerald-50/50"
                          >
                            Edit
                          </Button>
                      </div>
                      <div>
                        <span className="font-bold text-ink text-xl italic font-serif tracking-tight block mb-4">{section.title}</span>
                        <div className="space-y-3">
                          {section.fields.slice(0, 2).map(field => (
                            <div key={field.label} className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                              <span className="text-xs font-bold text-ink">{field.value || '--'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>

      {/* Full Sections (Desktop Wide) */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center gap-3 px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Detailed Profile Sections</h3>
            <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {sections.slice(5).map(section => (
                <div key={section.title} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-500">
                    <div className="p-10 space-y-8">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-health-green transition-colors">
                                  <section.icon className="w-7 h-7" />
                              </div>
                              <span className="font-bold text-2xl italic font-serif tracking-tight text-ink">{section.title}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveSection(section)}
                            className="rounded-2xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-slate-500 border-slate-100 hover:text-health-green hover:border-health-green/20 transition-all"
                          >
                            Edit Section
                          </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {section.fields.map(field => (
                          <div key={field.label} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                            <span className="text-base font-bold text-ink max-w-[60%] text-right">{field.value || 'Not set'}</span>
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


