import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 text-center bg-[#fcfbf8]">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-[#0f172a]">Health OS</h1>
        <p className="text-lg text-gray-600">
          The operating system for modern health programs.
        </p>
        <div className="flex flex-col gap-2 pt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Staff Login
          </Link>
          <Link to="/p/demo/join" className="text-sm text-blue-600 hover:underline">
            Demo Tenant: join program
          </Link>
        </div>
      </div>
    </div>
  );
}
