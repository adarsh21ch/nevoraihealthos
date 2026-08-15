import { createFileRoute } from '@tanstack/react-router'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export const Route = createFileRoute('/onboarding')({
  component: () => <OnboardingFlow />,
  head: () => ({
    title: 'Setup Your Journey | Fat2Fit',
    meta: [
      { name: 'description', content: 'Complete your personalized health profile to begin your 9-day transformation.' },
    ],
  }),
})
