import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '@/components/site/LandingPage'

export const Route = createFileRoute('/')({
  component: () => <LandingPage />,
  head: () => ({
    title: 'Fat2Fit | Premium 9-Day Metabolic Transformation',
    meta: [
      {
        name: 'description',
        content: 'Experience the ultimate 9-day health reset with Fat2Fit. Personalized AI coaching, Indian-specific nutrition, and the official C9 protocol for rapid results.',
      },
      { property: 'og:title', content: 'Fat2Fit | 9-Day Metabolic Evolution' },
      { property: 'og:description', content: 'Join the elite Fat2Fit program for a science-backed, AI-powered metabolic transformation.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
})
