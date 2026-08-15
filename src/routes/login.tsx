import { createFileRoute } from '@tanstack/react-router'
import LoginView from '@/components/auth/LoginView'

export const Route = createFileRoute('/login')({
  component: () => <LoginView />,
  head: () => ({
    title: 'Login | Fat2Fit Portal',
    meta: [
      { name: 'description', content: 'Access your personalized health dashboard and C9 protocol.' },
    ],
  }),
})
