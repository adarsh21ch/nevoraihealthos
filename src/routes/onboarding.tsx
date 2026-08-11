import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF8] px-6 py-20 font-sans">
      <div className="w-full max-w-sm space-y-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-3xl mx-auto shadow-xl shadow-slate-200 mb-8">H</div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Let's set up <br/> your profile.</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            We need a few more details to personalize your wellness journey.
          </p>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-left space-y-6">
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-slate-900 rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Step 1 of 4</span>
              <span>25% Complete</span>
            </div>
          </div>
          
          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Onboarding Flow <br/> Coming Soon</p>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
            Continue Setup
          </button>
        </div>
      </div>
    </div>
  );
}
