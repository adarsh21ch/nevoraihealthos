import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/how-it-works')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/how-it-works"!</div>
}
