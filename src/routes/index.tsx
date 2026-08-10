import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Globe, 
  Users, 
  Layers,
  ChevronRight,
  CheckCircle2,
  Play
} from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-900 selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-500">H</div>
            <span className="text-xl font-black tracking-tight text-white uppercase italic">Health OS</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Infrastructure', 'Solutions', 'Pricing', 'Developers'].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                href={`#${item.toLowerCase()}`} 
                className="text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                {item}
              </motion.a>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]">
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="group relative px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Join <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-32 md:pt-64 md:pb-48 px-6 overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto flex flex-col items-center relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 10,
              delay: 0.1
            }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-sm bg-blue-600 text-white text-[10px] font-black tracking-[0.25em] uppercase mb-12 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            System v2.0 Live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-[9.5rem] font-black tracking-[-0.08em] text-white leading-[0.75] mb-12 max-w-7xl uppercase italic"
          >
            Scale <br/> <span className="text-blue-600">Empire</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16 font-medium tracking-tight"
          >
            High-performance infrastructure for the world's leading health brands and wellness distributors.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-12 py-6 bg-white text-slate-950 rounded-lg text-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 group"
            >
              Get Started <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              to="/p/demo/join" 
              className="w-full sm:w-auto px-12 py-6 bg-slate-800/50 backdrop-blur-md border border-white/10 text-white rounded-lg text-xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-3 group"
            >
              <Play className="w-5 h-5 fill-white" /> Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[160px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[160px]" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto border-y border-white/5 py-16">
          <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 mb-16">
            Global Infrastructure Powering 500+ Health Brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-32 opacity-20 grayscale brightness-200">
            {['VITAMINS+', 'HEALTHCORE', 'BIOSTRIDE', 'WELLNESS CO.', 'PURELIFE'].map((name) => (
              <span key={name} className="font-black text-3xl tracking-tighter text-white uppercase italic">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Core Infrastructure - Grid Layout */}
      <section id="infrastructure" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 italic">Engineering Standard</h2>
            <h3 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
              Built for <br/> Massive Scale.
            </h3>
          </div>
          <p className="text-slate-400 text-lg max-w-sm pb-2 font-medium tracking-tight leading-snug">
            We handle the technical complexity so you can focus on building your empire. Enterprise-grade isolation at every layer.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 p-12 bg-slate-900 border border-white/5 hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-10 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">Multi-Tenant OS</h4>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md font-medium">
                Launch thousands of distributor portals on a single core. Hard data isolation with zero infrastructure overhead.
              </p>
              <div className="mt-12 flex gap-4">
                <div className="px-4 py-2 bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 border border-white/5">DB Isolation</div>
                <div className="px-4 py-2 bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 border border-white/5">Edge Logic</div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-linear-to-br from-blue-600/10 to-transparent rounded-full -mb-20 -mr-20 group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="md:col-span-4 p-12 bg-blue-600 text-white border border-blue-500 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 border border-white/30 flex items-center justify-center text-white mb-10 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-4xl font-black mb-6 uppercase italic tracking-tighter leading-none">Smart <br/> Logic.</h4>
              <p className="text-blue-100 text-lg leading-relaxed font-medium">
                Visual workflow builder for health journeys. Automated biometric tracking at scale.
              </p>
              <div className="mt-10 pt-10 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">View Specs</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>

          {[
            { title: "Bio Metrics", icon: <BarChart3 />, desc: "Real-time health intelligence.", color: "bg-slate-900 text-blue-500 border-white/5", value: "24.8k" },
            { title: "Active Tenants", icon: <Users />, desc: "Global distribution power.", color: "bg-slate-900 text-blue-500 border-white/5", value: "512" },
            { title: "Global CDN", icon: <Globe />, desc: "Distributed edge delivery.", color: "bg-slate-900 text-blue-500 border-white/5", value: "99.9%" },
          ].map((item, i) => (
            <div key={i} className={`md:col-span-4 p-10 bg-slate-900 border ${item.color} hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden`}>
              <div className="absolute top-4 right-6 text-4xl font-black text-white/5 italic select-none group-hover:text-blue-500/10 transition-colors">
                {item.value}
              </div>
              <div className={`w-14 h-14 bg-slate-800 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color.split(' ')[1]}`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-black text-white mb-3 uppercase italic tracking-tighter">{item.title}</h4>
              <p className="text-slate-400 font-medium tracking-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase / Demo Mockup */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-20"
              >
                <div className="bg-slate-900 border border-white/10 p-4 shadow-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="bg-slate-950 rounded-lg overflow-hidden border border-white/5 aspect-video relative">
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-slate-900 border border-white/5 rounded-md">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      </div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Core Interface v2</div>
                      <div className="w-3 h-3 rounded-full bg-slate-800" />
                    </div>
                    <div className="mt-20 px-10">
                      <div className="h-4 w-1/3 bg-slate-800 rounded-sm mb-4 animate-pulse" />
                      <div className="h-2 w-1/2 bg-slate-900 rounded-sm mb-8 animate-pulse" />
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-slate-900 border border-white/5 animate-pulse delay-[200ms]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 z-30 px-6 py-4 bg-blue-600 text-white border border-blue-500 shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/20 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-70">Realtime Ops</div>
                    <div className="text-xs font-black uppercase italic tracking-widest">Active Scale</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">Pure performance. <br/> Zero overhead.</h2>
              <div className="space-y-10">
                {[
                  { t: "Whitelabel Infrastructure", d: "Your brand at the forefront. Our tech invisible in the background." },
                  { t: "Automated Workflows", d: "Biometric triggers and smart follow-ups operating 24/7." },
                  { t: "High-Security Auth", d: "Military-grade encryption for sensitive patient health data." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-xs uppercase italic">
                      0{i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2 group-hover:text-blue-500 transition-colors uppercase italic tracking-tight">{item.t}</h4>
                      <p className="text-slate-400 font-medium tracking-tight leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA / Final Section */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-600 transform -rotate-1 scale-[1.02] group-hover:rotate-0 transition-transform duration-700 -z-10" />
          <div className="relative bg-white p-16 md:p-32 text-center overflow-hidden shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-[9rem] font-black text-slate-950 tracking-[-0.06em] mb-12 leading-[0.8] uppercase italic">
                Launch your <br/> Venture.
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 mb-16 max-w-2xl mx-auto leading-relaxed font-bold tracking-tight uppercase italic">
                Everything you need to scale health programs globally.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-16 py-8 bg-slate-950 text-white rounded-lg text-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-4 uppercase italic tracking-widest shadow-2xl"
                >
                  Join the Network <ArrowRight className="w-8 h-8" />
                </Link>
                <a href="mailto:sales@healthos.com" className="text-slate-900 font-black border-b border-slate-950/20 hover:border-slate-950 transition-all pb-1 text-lg uppercase italic tracking-widest">
                  Contact Sales
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20 italic">H</div>
                <span className="text-xl font-black tracking-tight text-white uppercase italic">Health OS</span>
              </div>
              <p className="text-slate-500 text-sm font-medium tracking-tight max-w-xs uppercase italic">
                Empowering the next generation of wellness entrepreneurs globally.
              </p>
            </div>
            <div className="flex flex-wrap gap-20">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Systems</h4>
                <ul className="space-y-2">
                  {['Infrastructure', 'Edge Logic', 'Vault', 'API'].map(i => (
                    <li key={i}><a href="#" className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase italic">{i}</a></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Access</h4>
                <ul className="space-y-2">
                  <li><Link to="/login" className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase italic">Login</Link></li>
                  <li><a href="/admin" className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase italic">Console</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
              © 2026 Health OS. Enterprise Standard.
            </p>
            <div className="flex gap-8">
              {['Status', 'Privacy', 'Terms'].map(i => (
                <a key={i} href="#" className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase italic">{i}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}