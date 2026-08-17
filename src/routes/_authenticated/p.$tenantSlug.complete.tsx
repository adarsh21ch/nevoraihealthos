import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, Share2 } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/complete')({
  component: CompletionPage,
});

function CompletionPage() {
  const navigate = useNavigate();
  const { tenantSlug } = Route.useParams();

  const { data: results } = useQuery({
    queryKey: ['completion-results'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase.from('customers').select('id').eq('user_id', user.id).single();
      const { data: measurements } = await supabase
        .from('measurements')
        .select('*')
        .eq('customer_id', profile!.id)
        .order('day_number', { ascending: true });
        
      return { measurements };
    }
  });

  const day1 = results?.measurements?.find(m => m.day_number === 1);
  const day9 = results?.measurements?.sort((a, b) => b.day_number - a.day_number)[0];
  const weightLoss = day1 && day9 ? (day1.weight_kg! - day9.weight_kg!).toFixed(1) : '0';

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 text-center space-y-10">
      <div className="w-24 h-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
        <Trophy className="w-12 h-12 text-accent" />
      </div>

      <header className="space-y-4">
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif leading-tight">
            You completed your<br/>metabolic journey.
        </h1>
        <p className="text-slate-500 font-medium">9 days of discipline, rebuilding, and focus.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight Loss</div>
                <div className="text-3xl font-bold text-ink italic font-serif">{weightLoss} kg</div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consistency</div>
                <div className="text-3xl font-bold text-ink italic font-serif">100%</div>
            </div>
        </div>

        <div className="h-px bg-slate-100 w-full"></div>

        <div className="space-y-4 text-left">
            <h3 className="font-bold text-ink">What's next?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
                Maintain your results with the F15 program. It's the ultimate nutrition foundation to keep building on your reset.
            </p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <Button className="w-full h-16 rounded-3xl bg-accent text-lg font-bold shadow-xl shadow-purple-200 gap-3 group">
            Start F15 Foundation
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button variant="ghost" className="w-full h-16 rounded-3xl text-slate-500 font-bold gap-3">
            <Share2 className="w-5 h-5" />
            Share Progress
        </Button>
      </div>
    </div>
  );
}
