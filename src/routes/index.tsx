import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbf8]">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-bold text-xl">H</div>
          <span className="text-2xl font-bold tracking-tighter text-[#0f172a]">Health OS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#0f172a] transition-colors">
            Sign In
          </Link>
          <Link 
            to="/login" 
            className="px-5 py-2.5 bg-[#0f172a] text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-4xl mx-auto pb-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Now in Private Beta
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-[#0f172a] leading-[1.1]">
            The operating system for <span className="text-slate-400 italic font-serif">modern</span> health programs.
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Health OS provides distributors and health coaches with the tools to manage multi-tenant programs, track customer progress, and scale their wellness business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl text-lg font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/p/demo/join" 
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-[#0f172a] rounded-2xl text-lg font-semibold hover:bg-slate-50 transition-all"
            >
              View Demo Program
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 text-left border-t border-slate-100 mt-16">
            <div className="space-y-2">
              <h3 className="font-bold text-[#0f172a]">Multi-Tenant</h3>
              <p className="text-sm text-gray-500 font-medium">Dedicated spaces for every distributor.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-[#0f172a]">Smart Journey</h3>
              <p className="text-sm text-gray-500 font-medium">Daily guidance and automated tasks.</p>
            </div>
            <div className="hidden md:block space-y-2">
              <h3 className="font-bold text-[#0f172a]">Real-time Insights</h3>
              <p className="text-sm text-gray-500 font-medium">Track adherence and measurements.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>© 2026 Health OS. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <Link to="/login" className="hover:text-gray-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
