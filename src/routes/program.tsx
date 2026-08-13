import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/program')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/program"!</div>
}
