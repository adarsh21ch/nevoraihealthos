import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTestimonials } from "@/lib/dashboard.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Quote, MessageSquare, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/testimonials")({
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const fetchTestimonials = useServerFn(getTestimonials);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["dashboard-testimonials"],
    queryFn: () => fetchTestimonials(),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Testimonials</h1>
        <p className="text-slate-500 mt-2 font-medium">Real transformations from athletes who gave consent to share.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))
        ) : testimonials?.map((customer: any) => {
          // Find earliest and latest photos for comparison
          const photos = [...(customer.progress_photos || [])].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          if (photos.length < 1) return null;
          
          const earliest = photos[0];
          const latest = photos[photos.length - 1];

          return (
            <Card key={customer.id} className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all overflow-hidden group">
              <div className="aspect-square relative flex">
                <div className="flex-1 relative overflow-hidden">
                   <img src={earliest.photo_url} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
                   <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">Before</div>
                </div>
                <div className="flex-1 relative overflow-hidden border-l-2 border-white">
                   <img src={latest.photo_url} className="absolute inset-0 w-full h-full object-cover" alt="After" />
                   <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">After</div>
                </div>
              </div>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-900">{customer.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-slate-400 hover:text-slate-900">
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl relative">
                  <Quote className="absolute -top-2 -left-1 h-6 w-6 text-slate-200 fill-slate-200" />
                  <p className="text-sm text-slate-500 italic relative z-10">Amazing transformation journey!</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && testimonials?.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No Testimonials Yet</p>
            <p className="text-sm mt-1">Testimonials appear here when customers give share consent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
