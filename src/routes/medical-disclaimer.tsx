import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/medical-disclaimer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/medical-disclaimer"!</div>
}
