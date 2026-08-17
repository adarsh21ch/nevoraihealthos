import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Utensils, 
  Leaf, 
  Info, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { PersonalizedPlan } from '@/components/nutrition/PersonalizedPlan';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/diet')({
  component: DietPage,
});

function DietPage() {
  const [activeTab, setActiveTab] = React.useState<'plan' | 'free' | 'recipes'>('plan');

  const { data: freeFoods } = useQuery({
    queryKey: ['free-foods'],
    queryFn: async () => {
      const { data } = await supabase
        .from('free_foods')
        .select('*')
        .order('category');
      return data || [];
    }
  });

  const recipes = [
      { title: 'Green Goddess Shake', cal: 180, time: '5m', cat: 'Shakes' },
      { title: 'Berry Antioxidant', cal: 210, time: '5m', cat: 'Shakes' },
      { title: 'Quinoa Power Bowl', cal: 550, time: '20m', cat: 'Meals' },
      { title: 'Grilled Salmon & Asparagus', cal: 580, time: '15m', cat: 'Meals' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 lg:px-12 pt-16 pb-32 animate-in fade-in duration-700 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <Utensils className="w-5 h-5 text-health-green" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nutrition Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-ink tracking-tighter italic font-serif leading-none">Diet & Recipes</h1>
        </div>
        <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 hidden md:block">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Phase 1: Metabolic Reset</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2.5rem] md:rounded-full gap-1 sticky top-24 z-30 shadow-sm border border-slate-200/50 max-w-2xl">
        <button 
            onClick={() => setActiveTab('plan')}
            className={cn(
                "flex-1 py-4 md:py-5 rounded-[2rem] md:rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'plan' ? "bg-emerald-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
        >
            My Personalized Plan
        </button>
        <button 
            onClick={() => setActiveTab('free')}
            className={cn(
                "flex-1 py-4 md:py-5 rounded-[2rem] md:rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'free' ? "bg-emerald-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
        >
            Free Foods
        </button>
        <button 
            onClick={() => setActiveTab('recipes')}
            className={cn(
                "flex-1 py-4 md:py-5 rounded-[2rem] md:rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'recipes' ? "bg-emerald-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
        >
            Explore Recipes
        </button>
      </div>

      {activeTab === 'plan' && <PersonalizedPlan />}

      {activeTab === 'free' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <section className="bg-emerald-50 rounded-[2.5rem] p-8 lg:p-12 space-y-8 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600">
                <BookOpen className="w-6 h-6" />
                <h3 className="font-bold text-xl">Nutrition Education</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button className="bg-white p-6 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md">
                  <div className="text-left">
                    <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Hydration Strategy</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Optimizing water intake</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
                </button>
                <button className="bg-white p-6 rounded-3xl flex items-center justify-between group shadow-sm transition-all hover:shadow-md">
                  <div className="text-left">
                    <h4 className="font-bold text-ink group-hover:text-health-green transition-colors">Food Education</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Making better choices</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-health-green transition-all" />
                </button>
              </div>
            </section>

            <section className="bg-emerald-900 rounded-[2.5rem] p-8 lg:p-12 space-y-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 text-health-green relative z-10">
                    <Target className="w-8 h-8" />
                    <h3 className="font-serif italic font-bold text-2xl lg:text-3xl">Protocol Rules</h3>
                </div>
                <p className="text-base lg:text-lg text-emerald-100/70 leading-relaxed font-medium relative z-10 max-w-sm">
                    Free foods are low-glycemic index items you can enjoy to help curb hunger. Stick to the suggested servings for best metabolic results.
                </p>
            </section>
          </div>

          <div className="space-y-10">
              {['unlimited', '1_serving', '2_servings'].map(cat => {
                  const items = freeFoods?.filter(f => f.category === cat);
                  if (!items?.length) return null;

                  return (
                      <div key={cat} className="space-y-6">
                          <div className="flex items-center gap-3 px-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                {cat.replace('_', ' ')}
                            </h4>
                            <div className="h-px flex-1 bg-slate-100"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {items.map(food => (
                                  <div key={food.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-6 group hover:border-health-green/20 transition-all duration-500">
                                      <div className="flex items-start justify-between">
                                          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-health-green transition-all">
                                              <Leaf className="w-7 h-7" />
                                          </div>
                                          <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-1">Serving</span>
                                            <span className="text-xs font-bold text-ink bg-slate-50 px-3 py-1 rounded-full">{food.serving_size || 'Fresh'}</span>
                                          </div>
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-ink text-xl lg:text-2xl italic font-serif group-hover:text-health-green transition-colors">{food.name}</h5>
                                        {food.calories_approx && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Approx. {food.calories_approx} kcal</p>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 animate-in fade-in duration-700">
            {recipes.map(recipe => (
                <button key={recipe.title} className="w-full text-left bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group space-y-10 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-health-green/20">
                    <div className="flex justify-between items-start">
                        <span className="px-5 py-2 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-emerald-50 group-hover:text-health-green transition-colors">
                            {recipe.cat}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-health-green group-hover:text-white transition-all">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-ink tracking-tight mb-4 italic font-serif group-hover:text-health-green transition-colors">
                            {recipe.title}
                        </h3>
                        <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-health-green/40" />
                              <span>{recipe.cal} Calories</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-health-green/40" />
                              <span>{recipe.time} Prep</span>
                            </div>
                        </div>
                    </div>
                </button>
            ))}
            
            <div className="bg-slate-50 rounded-[2.5rem] p-10 text-center border border-dashed border-slate-200">
              <p className="text-sm text-slate-400 font-medium italic">More recipes being added daily to your metabolic protocol.</p>
            </div>
        </div>
      )}
    </div>
  );
}
