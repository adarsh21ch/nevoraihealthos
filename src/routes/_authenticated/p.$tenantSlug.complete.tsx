import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompletionData, updateShareConsent, createReferral } from '@/lib/completion/completion.functions';
import { useServerFn } from '@tanstack/react-start';
import { Trophy, Share2, ArrowRight, MessageCircle, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
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
    queryFn: () => getCompletionFn(),
  });

  useEffect(() => {
    if (data) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [data]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Celebrating your success...</div>;
  if (!data) return null;

  const { brand_name, whatsapp_number, customer, program, stats, nextProgram } = data as any;

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1350
      });
      const link = document.createElement('a');
      link.download = `my-progress.png`;
      link.href = dataUrl;
      link.click();
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

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-slate-900" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
          You completed <span className="text-accent">{program?.name}</span>!
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Weight Loss</p>
            <p className="text-2xl font-black text-slate-900">{stats?.weightChange?.toFixed(1)} kg</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Share your card</h2>
          <div className="flex items-center space-x-2">
            <Checkbox id="consent" checked={shareConsent} onCheckedChange={(checked) => {
              setShareConsent(!!checked);
              updateConsentFn({ data: { consent: !!checked } });
            }} />
            <Label htmlFor="consent" className="text-xs text-slate-500">Include my photos</Label>
          </div>
        </div>
        <Button onClick={handleDownloadCard} disabled={isGenerating} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl">
          {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Share2 className="mr-2 w-5 h-5" />}
          Generate Progress Card
        </Button>
      </div>

      <div className="fixed -left-[2000px] top-0 overflow-hidden">
        <div ref={cardRef} className="w-[1080px] h-[1350px] bg-white p-20 flex flex-col justify-between relative">
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-widest">{brand_name}</h3>
                <p className="text-xl text-slate-400 font-bold">{program?.name} Finisher</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12">
               <div className="space-y-2">
                 <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Weight Change</p>
                 <p className="text-7xl font-black text-slate-900">{stats?.weightChange?.toFixed(1)} kg</p>
               </div>
            </div>
          </div>
          <div className="flex justify-between items-end border-t-4 border-slate-50 pt-12">
            <div className="space-y-4">
              <p className="text-3xl font-black text-slate-900">{customer?.name}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 bg-white border-4 border-slate-50 rounded-[2rem]">
                <QRCodeSVG value={`https://${window.location.host}/p/fat2fit`} size={160} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <Button variant="link" asChild className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <Link to={`/p/fat2fit/journey` as any}>Back to my journey</Link>
        </Button>
      </div>
    </div>
  );
}