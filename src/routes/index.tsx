import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center bg-[#fcfbf8]">
      <Toaster />
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">Health OS</h1>
        <p className="text-lg text-gray-600">
          The operating system for modern health programs.
        </p>
      </div>
    </div>
  );
}
