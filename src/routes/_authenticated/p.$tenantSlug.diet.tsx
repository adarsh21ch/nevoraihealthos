import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Utensils, 
  Leaf, 
  Info, 
  Search, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/diet')({
  component: DietPage,
});

function DietPage() {
  const [activeTab, setActiveTab] = useState<'free' | 'recipes'>('free');
  
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
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-4">
           <Utensils className="w-5 h-5 text-accent" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">C9 Nutrition</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Diet & Recipes</h1>
      </header>

      <div className="flex bg-slate-50 p-1.5 rounded-[2rem] gap-1">
        <button 
            onClick={() => setActiveTab('free')}
            className={cn(
                "flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'free' ? "bg-white text-ink shadow-sm" : "text-slate-400"
            )}
        >
            Free Foods
        </button>
        <button 
            onClick={() => setActiveTab('recipes')}
            className={cn(
                "flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'recipes' ? "bg-white text-ink shadow-sm" : "text-slate-400"
            )}
        >
            Recipes
        </button>
      </div>

      {activeTab === 'free' ? (
        <div className="space-y-8">
            <section className="bg-purple-50 rounded-[2.5rem] p-8 space-y-4">
                <div className="flex items-center gap-3 text-accent">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold">Protocol Info</h3>
                </div>
                <p className="text-sm text-purple-900/70 leading-relaxed font-medium">
                    Free foods are low-glycemic index items you can enjoy to help curb hunger. Stick to the suggested servings for best results.
                </p>
            </section>

            <div className="space-y-6">
                {['unlimited', '1_serving', '2_servings'].map(cat => {
                    const items = freeFoods?.filter(f => f.category === cat);
                    if (!items?.length) return null;

                    return (
                        <div key={cat} className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                                {cat.replace('_', ' ')}
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {items.map(food => (
                                    <div key={food.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Leaf className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-ink">{food.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            {food.serving_size || 'Fresh'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            {recipes.map(recipe => (
                <button key={recipe.title} className="w-full text-left bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="px-4 py-1.5 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {recipe.cat}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-ink tracking-tight mb-2 group-hover:text-accent transition-colors">
                            {recipe.title}
                        </h3>
                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>{recipe.cal} Calories</span>
                            <span>•</span>
                            <span>{recipe.time} Prep</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      )}
    </div>
  );
}
