import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Complete your profile</h1>
        <p className="text-slate-400">Onboarding flow coming soon...</p>
      </div>
    </div>
  );
}
