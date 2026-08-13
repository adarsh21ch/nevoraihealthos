import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tips")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/content" });
  },
  component: () => null,
});

