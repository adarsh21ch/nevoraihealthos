import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center bg-[#fcfbf8]">
      <h1 className="text-4xl font-bold mb-4">Lovable Project Rules — Nevorai</h1>
      <p className="max-w-2xl text-lg text-gray-700 leading-relaxed">
        Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.
      </p>
    </div>
  );
}
