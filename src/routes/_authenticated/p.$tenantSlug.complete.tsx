import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompletionData, updateShareConsent, createReferral } from '@/lib/completion/completion.functions';
import { useServerFn } from '@tanstack/react-start';
import { Trophy, Share2, Download, ArrowRight, MessageCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/complete')({
  component: CompletionPage,
});

function CompletionPage() {
  const { tenantSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const getCompletionFn = useServerFn(getCompletionData);
  const updateConsentFn = useServerFn(updateShareConsent);
  const createReferralFn = useServerFn(createReferral);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referral, setReferral] = useState({ name: '', phone: '' });
  const [referralSent, setReferralSent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['completion', tenantSlug],
    queryFn: () => getCompletionFn({ data: { tenantSlug } }),
  });

  useEffect(() => {
    if (data) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [data.tenant.primary_color || '#16a34a', '#ffffff', '#000000']
      });
    }
  }, [data]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Celebrating your success...</div>;
  if (!data) return null;

  const { tenant, customer, enrollment, stats, nextProgram, ownerName } = data;

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1350,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      
      const link = document.createElement('a');
      link.download = `my-progress-${tenantSlug}.png`;
      link.href = dataUrl;
      link.click();

      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'progress.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: `I completed ${enrollment.programs.name}!`,
          text: `Just finished my ${enrollment.programs.duration_days} day journey with ${tenant.name}. Check it out!`
        });
      }
      toast.success("Progress card generated!");
    } catch (err) {
      toast.error("Failed to generate card");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReferralFn({
        data: {
          tenantId: tenant.id,
          leadName: referral.name,
          leadPhone: referral.phone
        }
      });
      setReferralSent(true);
      toast.success("Referral sent! Thank you.");
    } catch (err) {
      toast.error("Failed to send referral");
    }
  };

  const whatsappLink = (msg: string) => `https://wa.me/${tenant.whatsapp?.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-[var(--accent)]" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
          You completed <span className="text-[var(--accent)]">{enrollment.programs.name}</span>!
        </h1>
        <p className="text-slate-500 font-medium">
          {enrollment.programs.duration_days} days of discipline, results that speak for themselves.
        </p>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Weight Loss</p>
            <p className="text-2xl font-black text-slate-900">{stats.weightChange.toFixed(1)} kg</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Waist Loss</p>
            <p className="text-2xl font-black text-slate-900">{stats.waistChange.toFixed(1)} cm</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Share your card</h2>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="consent" 
              checked={shareConsent} 
              onCheckedChange={(checked) => {
                setShareConsent(!!checked);
                updateConsentFn({ data: { consent: !!checked } });
              }} 
            />
            <Label htmlFor="consent" className="text-xs text-slate-500">Include my photos</Label>
          </div>
        </div>

        <Button 
          onClick={handleDownloadCard} 
          disabled={isGenerating}
          className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
        >
          {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Share2 className="mr-2 w-5 h-5" />}
          Generate Progress Card
        </Button>
      </div>

      {/* Hidden Node for Card Generation */}
      <div className="fixed -left-[2000px] top-0 overflow-hidden">
        <div 
          ref={cardRef}
          className="w-[1080px] h-[1350px] bg-white p-20 flex flex-col justify-between relative"
          style={{ '--accent': tenant.primary_color || '#16a34a' } as any}
        >
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {tenant.logo_url && <img src={tenant.logo_url} className="h-20 w-auto" loading="lazy" alt="" />}
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{tenant.name}</h3>
                  <p className="text-xl text-slate-400 font-bold">{enrollment.programs.name} Finisher</p>
                </div>
              </div>
              <div className="bg-[var(--accent)] text-white px-8 py-3 rounded-full text-2xl font-black uppercase tracking-widest">
                Day {enrollment.programs.duration_days}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 h-[700px]">
              <div className="rounded-[3rem] bg-slate-50 border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                {shareConsent && (data as any).photos?.[0] ? (
                   <img src={(data as any).photos[0].photo_url} className="w-full h-full object-cover" loading="lazy" alt="" />
                ) : (
                  <div className="text-slate-300 text-2xl font-bold uppercase tracking-widest italic opacity-20">
                    {shareConsent ? 'No Photos' : 'Private'}
                  </div>
                )}
                {shareConsent && (data as any).photos?.[0] && <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-xl font-bold text-white uppercase tracking-widest">Before</div>}
              </div>
              <div className="rounded-[3rem] bg-slate-50 border-4 border-[var(--accent)] flex items-center justify-center relative overflow-hidden">
                {shareConsent && (data as any).photos?.length > 1 ? (
                  <img src={(data as any).photos[(data as any).photos.length - 1].photo_url} className="w-full h-full object-cover" loading="lazy" alt="" />
                ) : (
                  <div className="text-slate-300 text-2xl font-bold uppercase tracking-widest italic opacity-20">
                    {shareConsent ? 'No Photos' : 'Private'}
                  </div>
                )}
                {shareConsent && (data as any).photos?.length > 1 && <div className="absolute top-8 right-8 bg-[var(--accent)] px-6 py-2 rounded-full text-xl font-bold text-white uppercase tracking-widest">After</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
               <div className="space-y-2">
                 <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Weight Change</p>
                 <p className="text-7xl font-black text-slate-900">{stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg</p>
               </div>
               <div className="space-y-2">
                 <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Waist Change</p>
                 <p className="text-7xl font-black text-slate-900">{stats.waistChange > 0 ? '+' : ''}{stats.waistChange.toFixed(1)} cm</p>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-end border-t-4 border-slate-50 pt-12">
            <div className="space-y-4">
              <p className="text-3xl font-black text-slate-900">{customer.name}</p>
              <div className="flex items-center gap-4 text-[var(--accent)] font-bold text-2xl">
                <MessageCircle className="w-8 h-8" /> {tenant.whatsapp}
              </div>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 bg-white border-4 border-slate-50 rounded-[2rem]">
                <QRCodeSVG value={`https://${window.location.host}/p/${tenantSlug}`} size={160} />
              </div>
              <p className="text-xl font-bold text-slate-400">Join the journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Program CTA */}
      {nextProgram && (
        <Card className="rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl overflow-hidden">
          <CardContent className="p-10 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Next Step</p>
              <h2 className="text-3xl font-black tracking-tight">{nextProgram.name}</h2>
              <p className="text-white/70 font-medium">Continue your transformation for another {nextProgram.duration_days} days.</p>
            </div>
            <Button 
              asChild
              className="w-full h-16 bg-white text-slate-900 font-black rounded-2xl text-lg hover:bg-slate-100 transition-all active:scale-95"
            >
              <a href={whatsappLink(`Hi ${ownerName}, I just completed ${enrollment.programs.name}. I want to start ${nextProgram.name}.`)} target="_blank">
                Start {nextProgram.name} <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Referral section */}
      <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Refer a Friend</h2>
            <p className="text-slate-500 font-medium">Help someone start their transformation journey today.</p>
          </div>

          {referralSent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                 <CheckCircle2 className="w-8 h-8" />
               </div>
               <p className="font-bold text-slate-900">Thank you for sharing!</p>
               <Button variant="ghost" className="text-[var(--accent)] font-bold" onClick={() => setReferralSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSendReferral} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="r-name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Friend's Name</Label>
                <Input 
                  id="r-name" 
                  required 
                  placeholder="John Doe" 
                  className="h-12 rounded-xl"
                  value={referral.name}
                  onChange={e => setReferral({...referral, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp Number</Label>
                <Input 
                  id="r-phone" 
                  required 
                  placeholder="+1234567890" 
                  className="h-12 rounded-xl"
                  value={referral.phone}
                  onChange={e => setReferral({...referral, phone: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full h-14 bg-slate-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">
                <UserPlus className="mr-2 w-4 h-4" /> Send Referral
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-50">
             <Button 
                variant="outline" 
                className="w-full h-14 rounded-xl border-slate-200 text-slate-600 font-bold active:scale-95 transition-all"
                onClick={() => {
                  const link = `https://${window.location.host}/p/${tenantSlug}/join`;
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied to clipboard!");
                }}
             >
               Copy Shareable Link
             </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
        <Button variant="link" asChild className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <Link to={`/p/${tenantSlug}/journey` as any}>Back to my journey</Link>
        </Button>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
