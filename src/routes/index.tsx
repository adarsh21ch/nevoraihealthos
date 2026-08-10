import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0f172a] rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
            <span className="text-xl font-bold tracking-tighter text-[#0f172a]">Health OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-[#0f172a] transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium text-gray-500 hover:text-[#0f172a] transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-[#0f172a] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#0f172a] transition-colors">
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="px-5 py-2 bg-[#0f172a] text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase mb-8 border border-blue-100">
            Introducing Health OS 2.0
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-[#0f172a] leading-[1.05] mb-8 max-w-5xl">
            Empower your health business with <span className="text-blue-600">intelligence</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
            The multi-tenant infrastructure for health coaches and distributors to scale personalized wellness programs globally.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-10 py-5 bg-[#0f172a] text-white rounded-2xl text-lg font-semibold hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-2xl shadow-slate-200"
            >
              Start Building for Free
            </Link>
            <Link 
              to="/p/demo/join" 
              className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-[#0f172a] rounded-2xl text-lg font-semibold hover:bg-slate-50 hover:scale-[1.02] transition-all"
            >
              Explore Demo
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
        </div>
      </header>

      {/* Stats/Logo Cloud */}
      <section className="py-12 px-8 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="font-black text-2xl text-slate-400">VITAMINS+</div>
          <div className="font-black text-2xl text-slate-400">HEALTHCORE</div>
          <div className="font-black text-2xl text-slate-400">BIOSTRIDE</div>
          <div className="font-black text-2xl text-slate-400">WELLNESS CO.</div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Core Infrastructure</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-[#0f172a]">Built for Scale.</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Multi-Tenant Architecture",
              desc: "Dedicated workspaces for every distributor with complete data isolation and custom branding.",
              icon: "🏢"
            },
            {
              title: "Smart Program Builder",
              desc: "Design complex health journeys with automated tasks, meal guidance, and supplement tracking.",
              icon: "⚡"
            },
            {
              title: "Patient Adherence",
              desc: "Real-time tracking of mood, water, and task completion with automated follow-ups for at-risk users.",
              icon: "📈"
            }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
              <h4 className="text-xl font-bold text-[#0f172a] mb-4">{f.title}</h4>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto bg-[#0f172a] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to transform your health business?</h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join 500+ distributors worldwide who are scaling their impact with Health OS.
            </p>
            <Link 
              to="/login" 
              className="inline-block px-10 py-5 bg-white text-[#0f172a] rounded-2xl text-lg font-bold hover:bg-slate-100 hover:scale-[1.05] transition-all"
            >
              Get Started for Free
            </Link>
          </div>
          {/* Background circles */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white font-bold">H</div>
                <span className="text-xl font-bold tracking-tighter text-[#0f172a]">Health OS</span>
              </div>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                The leading infrastructure for modern health programs and wellness distribution.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-4">
                <h5 className="font-bold text-[#0f172a]">Product</h5>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">Infrastructure</a></li>
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">Program Builder</a></li>
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">API</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-[#0f172a]">Company</h5>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-[#0f172a] transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-[#0f172a]">Admin</h5>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><Link to="/login" className="hover:text-[#0f172a] transition-colors">Login</Link></li>
                  <li><a href="/admin" className="hover:text-[#0f172a] transition-colors">Platform Admin</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium border-t border-slate-50 pt-8">
            <p>© 2026 Health OS. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#0f172a] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#0f172a] transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-[#0f172a] transition-colors">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
