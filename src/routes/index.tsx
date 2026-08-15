import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 text-emerald-900 p-8">
      <h1 className="text-6xl font-serif mb-4">Fat2Fit</h1>
      <p className="text-xl mb-8">Premium 9-Day Metabolic Transformation</p>
      <a href="/login" className="px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold uppercase tracking-widest">
        Join the Program
      </a>
    </div>
  ),
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
