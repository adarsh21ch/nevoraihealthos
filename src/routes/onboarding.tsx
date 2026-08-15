import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/onboarding')({
  component: () => {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-8 text-center">
        <h1 className="text-4xl font-serif mb-4 text-emerald-900">Welcome to Onboarding</h1>
        <p className="text-lg mb-8 text-slate-500 max-w-md">
          We are preparing your personalized 9-day metabolic journey.
        </p>
        <Button 
          onClick={() => navigate({ to: '/_authenticated/p.$tenantSlug/journey', params: { tenantSlug: 'fat2fit' } } as any)}
          className="px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold uppercase tracking-widest"
        >
          Continue to Dashboard
        </Button>
      </div>
    );
  },
  head: () => ({
    title: 'Setup Your Journey | Fat2Fit',
    meta: [
      { name: 'description', content: 'Complete your personalized health profile to begin your 9-day transformation.' },
    ],
  }),
})
