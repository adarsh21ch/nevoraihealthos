import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/programs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/programs"!</div>
}
