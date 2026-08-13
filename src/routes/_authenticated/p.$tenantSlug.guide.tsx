import { createFileRoute, redirect } from '@tanstack/react-router';
import { BookOpen, PlayCircle, FileText, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/guide')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/p/${params.tenantSlug}/profile` as any });
  },
  component: GuidePage,
});

function GuidePage() {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Program Overview', type: 'video', duration: '3:45' },
        { title: 'Preparation Checklist', type: 'pdf', size: '1.2 MB' },
        { title: 'Goal Setting Guide', type: 'article', readTime: '5 min' },
      ]
    },
    {
      title: 'The C9 Protocol',
      items: [
        { title: 'Understanding DX4 vs C9', type: 'article', readTime: '8 min' },
        { title: 'How to use the Supplements', type: 'video', duration: '5:20' },
        { title: 'Hydration Strategy', type: 'article', readTime: '4 min' },
      ]
    }
  ];

  return (
    <div className="max-w-md mx-auto px-6 pt-16 pb-24 animate-in fade-in duration-700 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-4">
           <BookOpen className="w-5 h-5 text-accent" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Base</span>
        </div>
        <h1 className="text-5xl font-bold text-ink tracking-tighter italic font-serif">Guide & Tips</h1>
      </header>

      <section className="bg-red-50 rounded-[2.5rem] p-8 space-y-4 border border-red-100">
        <div className="flex items-center gap-3 text-red-600">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-bold text-lg italic font-serif">Medical Notice</h3>
        </div>
        <p className="text-sm text-red-900/70 leading-relaxed font-medium">
            This program is a nutritional reset. If you are pregnant, breastfeeding, or taking medication, please consult your physician before starting.
        </p>
      </section>

      <div className="space-y-12">
        {sections.map((section) => (
            <div key={section.title} className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">
                    {section.title}
                </h2>
                <div className="space-y-4">
                    {section.items.map((item) => (
                        <button 
                            key={item.title} 
                            className="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group text-left"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-accent group-hover:text-white transition-all flex items-center justify-center">
                                    {item.type === 'video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-ink group-hover:text-accent transition-colors">{item.title}</h4>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {item.type} • {item.duration || item.size || item.readTime}
                                    </span>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-200 group-hover:text-accent transition-all" />
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold italic font-serif tracking-tight">Need Support?</h3>
            <p className="text-slate-400 text-sm font-medium">Your coach is here to help you through every step of the journey.</p>
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 rounded-2xl h-14 font-bold shadow-xl shadow-purple-900/20">
            Message Coach
          </Button>
      </div>
    </div>
  );
}
