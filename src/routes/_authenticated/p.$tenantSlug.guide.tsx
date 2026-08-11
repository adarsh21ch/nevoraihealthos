import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getProgramContent } from '@/lib/program-content.functions';
import { 
  BookOpen, Lightbulb, HelpCircle, ChevronRight, 
  Utensils, MessageCircle, Info, Search
} from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/guide')({
  component: GuidePage,
});

function GuidePage() {
  const { tenantSlug } = Route.useParams();
  const getContentFn = useServerFn(getProgramContent);

  const { data: tips, isLoading: loadingTips } = useQuery({
    queryKey: ['guide-tips', tenantSlug],
    queryFn: () => getContentFn({ data: { tenantSlug, type: 'tips' } }),
  });

  const { data: faqs, isLoading: loadingFaqs } = useQuery({
    queryKey: ['guide-faqs', tenantSlug],
    queryFn: () => getContentFn({ data: { tenantSlug, type: 'faqs' } }),
  });

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-8 animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Protocol Guide</h1>
        <p className="text-slate-400 font-medium">Master your transformation.</p>
      </div>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 bg-slate-100 rounded-full h-12 p-1">
          <TabsTrigger value="meals" className="rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            MEALS
          </TabsTrigger>
          <TabsTrigger value="tips" className="rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            TIPS
          </TabsTrigger>
          <TabsTrigger value="faqs" className="rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold">The Golden Rule</h3>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed italic">
                "Wait 20 minutes before and after taking your supplements to eat or drink anything other than water."
              </p>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1">Sample Schedule</h4>
               <div className="space-y-4">
                 {[
                   { time: 'Morning', icon: '☀️', text: 'Supplements + 500ml Water' },
                   { time: 'Breakfast', icon: '🥣', text: 'Low GI protein-focused meal' },
                   { time: 'Lunch', icon: '🥗', text: 'High fiber vegetables + Lean protein' },
                   { time: 'Dinner', icon: '🍲', text: 'Lighter protein + cooked greens' }
                 ].map((step) => (
                   <div key={step.time} className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <div className="text-2xl">{step.icon}</div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{step.time}</p>
                        <p className="text-sm font-bold text-slate-900">{step.text}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {loadingTips ? (
             <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></div>
           ) : (
             <div className="space-y-6">
                {tips?.map((tip: any) => (
                  <div key={tip.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-1 rounded-full uppercase tracking-widest">
                         {tip.category || 'General'}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{tip.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {tip.content}
                    </p>
                  </div>
                ))}
                {(!tips || tips.length === 0) && (
                   <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">More tips coming soon</p>
                   </div>
                )}
             </div>
           )}
        </TabsContent>

        <TabsContent value="faqs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {loadingFaqs ? (
             <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" /></div>
           ) : (
             <div className="space-y-6">
                <div className="relative mb-8">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input placeholder="Search questions..." className="h-14 pl-14 pr-6 rounded-2xl border-slate-100 bg-white font-medium text-sm" />
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs?.map((faq: any) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-none">
                      <AccordionTrigger className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:no-underline text-left data-[state=open]:rounded-b-none transition-all">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{faq.category || 'Support'}</p>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{faq.question}</h4>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-8 pt-0 bg-white border border-t-0 border-slate-100 rounded-b-[2rem] shadow-sm">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium border-t border-slate-50 pt-6">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {(!faqs || faqs.length === 0) && (
                   <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <HelpCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No FAQs found</p>
                   </div>
                )}
             </div>
           )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-16 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 text-center">
         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-blue-100 mx-auto mb-6">
            <MessageCircle className="w-6 h-6 text-blue-500" />
         </div>
         <h3 className="font-bold text-slate-900 mb-2">Still need help?</h3>
         <p className="text-sm text-slate-500 font-medium mb-8">Your health coach is just a message away.</p>
         <Button className="w-full h-14 bg-blue-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-blue-500/10 transition-all active:scale-95">
            Chat with Coach
         </Button>
      </div>
    </div>
  );
}
