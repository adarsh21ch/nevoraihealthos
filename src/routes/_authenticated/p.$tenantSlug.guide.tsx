import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/guide')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/p/$tenantSlug/profile',
      params: { tenantSlug: params.tenantSlug },
      replace: true,
    });
  },
  component: () => null,
});
