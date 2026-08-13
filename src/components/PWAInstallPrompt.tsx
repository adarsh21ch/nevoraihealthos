import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { toast } from "sonner";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(null);

  useEffect(() => {
    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform("ios");
    } else if (/android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("other");
    }

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not installed and we have a prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we check if it's not standalone and show instructions
    if (/iphone|ipad|ipod/.test(ua) && !isStandalone) {
      // Small delay to not annoy immediately
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success("Welcome to Fat2Fit!");
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-80">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-10 bg-ink rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            F2F
          </div>
          <div>
            <h3 className="font-bold text-ink">Install Fat2Fit</h3>
            <p className="text-xs text-slate-500">Add to home screen for the full experience.</p>
          </div>
        </div>

        {platform === "ios" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
              <Share className="w-4 h-4 text-accent" />
              <span>Tap the <span className="font-bold">Share</span> button below</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
              <PlusSquare className="w-4 h-4 text-accent" />
              <span>Select <span className="font-bold">Add to Home Screen</span></span>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleInstall}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl h-12 gap-2"
          >
            <Download className="w-4 h-4" />
            Install App
          </Button>
        )}
      </div>
    </div>
  );
}
