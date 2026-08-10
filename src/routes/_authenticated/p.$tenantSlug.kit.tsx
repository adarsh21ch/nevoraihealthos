import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/p/$tenantSlug/kit')({
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">My Kit</h1>
      <p className="text-slate-500">View and manage your supplements and tools here.</p>
    </div>
  ),
});
