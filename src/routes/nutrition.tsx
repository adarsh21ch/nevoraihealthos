import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nutrition')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/nutrition"!</div>
}
