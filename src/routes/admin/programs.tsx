import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/programs")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/content" });
  },
  component: () => null,
});

