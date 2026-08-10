import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/progress')({
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Progress</h1>
      <p className="text-slate-500">Your health stats and transformations will appear here soon.</p>
    </div>
  ),
});
