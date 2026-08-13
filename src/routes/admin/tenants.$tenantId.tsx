import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tenants/$tenantId")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
  component: () => null,
});
