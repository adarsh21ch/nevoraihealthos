import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/tips')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/tips"!</div>
}
