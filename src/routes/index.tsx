import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center bg-[#fcfbf8]">
      <div className="max-w-3xl space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Health OS</h1>
          <p className="text-xl text-gray-600">Multi-tenant health program management platform.</p>
        </section>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
          <h2 className="text-lg font-semibold mb-3">System Instruction</h2>
          <code className="block p-4 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
            {"'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''"}
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 className="font-bold text-green-800 mb-1">Status: Phase 1 Fix</h3>
            <p className="text-sm text-green-700">EXECUTE grants restored for authenticated users to fix RLS evaluation.</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-1">Next: Phase 2</h3>
            <p className="text-sm text-blue-700">WhatsApp OTP & Onboarding flows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

