import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/guide')({
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Program Guide</h1>
      <p className="text-slate-500">Access your detailed protocol and learning materials here.</p>
    </div>
  ),
});
