import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movement')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movement"!</div>
}
