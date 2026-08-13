import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKnowledgeItems, upsertKnowledgeItem, KnowledgeItem } from '@/lib/knowledge/knowledge.functions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/knowledge')({
  component: KnowledgeAdminPage,
});

function KnowledgeAdminPage() {
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'APPROVED'>('ALL');
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['knowledge-items', filter],
    queryFn: () => getKnowledgeItems({ 
      data: {
        status: filter === 'ALL' ? undefined : filter as any 
      }
    })
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: KnowledgeItem['status'] }) => {
      const item = items?.find(i => i.id === vars.id);
      if (!item) throw new Error("Item not found");
      return upsertKnowledgeItem({
        data: {
          ...item,
          status: vars.status
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast.success("Knowledge status updated");
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'DRAFT': return <Clock className="w-4 h-4 text-slate-400" />;
      case 'UNDER_REVIEW': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-bold text-ink tracking-tight font-serif">Fat2Fit AI Grounding</h1>
        </div>
        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6">
          <Plus className="w-4 h-4" />
          Add Knowledge
        </Button>
      </header>

      <div className="flex gap-4 border-b border-slate-100 pb-4">
        {['ALL', 'DRAFT', 'APPROVED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all",
              filter === f ? "bg-ink text-white" : "text-slate-400 hover:text-ink"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items?.map(item => (
            <Card key={item.id} className="p-6 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-full">
                    {item.type}
                  </span>
                  {getStatusIcon(item.status)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
                {item.tags && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ink">
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                {item.status === 'DRAFT' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                    onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'APPROVED' })}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
