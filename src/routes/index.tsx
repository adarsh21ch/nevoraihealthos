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
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // We remove the scroll-based opacity/scale effects that cause the white-out issues
  // while keeping the structure for other future animations if needed.
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 1]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-[#fcfbf8] selection:bg-blue-100 selection:text-blue-900">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/50 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-slate-200">H</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Health OS</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Infrastructure', 'Solutions', 'Pricing', 'Developers'].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href={`#${item.toLowerCase()}`} 
                className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                onClick={(e) => {
                  if (['solutions', 'pricing', 'developers'].includes(item.toLowerCase())) {
                    e.preventDefault();
                    const element = document.getElementById(item.toLowerCase());
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                {item}
              </motion.a>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="group relative px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6 overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto flex flex-col items-center relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-blue-700 text-[11px] font-black tracking-[0.15em] uppercase mb-10 backdrop-blur-sm shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Next-Gen Infrastructure for Health
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-[7.5rem] font-bold tracking-[-0.04em] text-slate-900 leading-[0.9] mb-10 max-w-6xl text-gradient"
          >
            Empower your health business with <span className="relative inline-block">intelligence<motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.8, duration: 0.8 }} className="absolute -bottom-2 left-0 h-2 bg-blue-500/20 rounded-full" /></span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-16 font-medium"
          >
            The world's first multi-tenant orchestration layer designed specifically for health coaches and wellness distributors.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-[2rem] text-xl font-bold hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-3 group"
            >
              Start Building <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/p/demo/join" 
              className="w-full sm:w-auto px-12 py-6 glass-card text-slate-900 rounded-[2rem] text-xl font-bold hover:bg-white hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 group"
            >
              <Play className="w-5 h-5 fill-slate-900" /> Watch Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[160px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-50/40 rounded-full blur-[160px]" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        </div>
      </header>

      {/* Trusted By Section - Animated Marquee */}
      <section className="py-12 px-6 relative overflow-hidden bg-white/30 backdrop-blur-sm border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex-shrink-0 pr-12 border-r border-slate-200/50 hidden lg:block">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Global Brands
            </p>
          </div>
          
          <div className="flex-1 relative">
            <div className="flex overflow-hidden group">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: 25, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop"
                }}
                className="flex items-center gap-20 md:gap-32 whitespace-nowrap pl-12"
              >
                {[
                  'VITAMINS+', 'HEALTHCORE', 'BIOSTRIDE', 'WELLNESS CO.', 'PURELIFE',
                  'VITAMINS+', 'HEALTHCORE', 'BIOSTRIDE', 'WELLNESS CO.', 'PURELIFE'
                ].map((name, i) => (
                  <span 
                    key={`${name}-${i}`} 
                    className="font-black text-2xl md:text-3xl tracking-tighter text-slate-900 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </motion.div>
            </div>
            {/* Gradient Fades for the marquee */}
            <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#fcfbf8] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#fcfbf8] to-transparent z-10" />
          </div>
        </div>
      </section>

      {/* Core Infrastructure - Grid Layout */}
      <section id="infrastructure" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Foundational Layer</h2>
            <h3 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Engineered for the future of wellness.
            </h3>
          </div>
          <p className="text-slate-500 text-lg max-w-sm pb-2">
            A specialized stack designed to handle the complexities of health data isolation, program automation, and patient engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 p-12 rounded-[3rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all duration-500 group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-10 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-slate-900 mb-6">Multi-Tenant Orchestration</h4>
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                Launch unlimited distributor-branded portals on a single core. Complete data isolation with zero infrastructure overhead.
              </p>
              <div className="mt-12 flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100">RLS Isolated</div>
                <div className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100">Dynamic Theming</div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-linear-to-br from-blue-50 to-transparent rounded-full -mb-20 -mr-20 group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="md:col-span-4 p-12 rounded-[3rem] bg-slate-900 text-white border border-slate-800 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 mb-10 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold mb-6">Smart Program Engine</h4>
              <p className="text-slate-400 text-lg leading-relaxed">
                Visual workflow builder for health journeys. Automate tasks, follow-ups, and biometric tracking.
              </p>
              <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold opacity-60">Learn more</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>

          {[
            { title: "Biometric Intelligence", icon: <BarChart3 />, desc: "Real-time health trend analysis.", color: "bg-emerald-50 text-emerald-600" },
            { title: "Secure Data Vault", icon: <ShieldCheck />, desc: "HIPAA-ready encrypted storage.", color: "bg-indigo-50 text-indigo-600" },
            { title: "Global CDN", icon: <Globe />, desc: "Edge-delivery for global teams.", color: "bg-amber-50 text-amber-600" },
          ].map((item, i) => (
            <div key={i} className="md:col-span-4 p-10 rounded-[3rem] bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-slate-500">{item.desc}</p>
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
                <div className="glass-card rounded-[2.5rem] p-4 shadow-3xl">
                  <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 aspect-video relative">
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-100">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dashboard Preview</div>
                      <div className="w-4 h-4 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-20 px-10">
                      <div className="h-6 w-1/3 bg-slate-200 rounded-full mb-4 animate-pulse" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded-full mb-8 animate-pulse" />
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse delay-[200ms]" />
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
                className="absolute -top-10 -right-10 z-30 px-6 py-4 glass-card rounded-2xl flex items-center gap-4 border-emerald-100 shadow-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Health</div>
                  <div className="text-sm font-bold text-slate-900">100% Operational</div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-12">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">Beautifully simple for coaches, powerful for teams.</h2>
              <div className="space-y-8">
                {[
                  { t: "Whitelabel Everything", d: "Your brand, your logo, your colors. Completely invisible infrastructure." },
                  { t: "Automated Day-to-Day", d: "From onboarding to Day 90 follow-ups, everything runs on autopilot." },
                  { t: "Enterprise Permissions", d: "Roles for Admins, Distributors, Mentors, and Customers." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.t}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions & Developers Section */}
      <section id="solutions" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div id="developers" className="p-12 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Developer API</h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Built for scale.</h3>
              <p className="text-slate-500 text-lg mb-8">
                Integrate your existing health tools with our robust API. Webhooks, real-time biometrics, and secure data pipelines.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span>GraphQL & REST endpoints</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span>Real-time WebSocket events</span>
                </div>
              </div>
            </div>
            <div className="p-12 rounded-[3rem] bg-slate-900 text-white shadow-sm hover:shadow-xl transition-all duration-500">
              <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Enterprise Solutions</h2>
              <h3 className="text-4xl font-bold mb-6">Tailored for teams.</h3>
              <p className="text-slate-400 text-lg mb-8">
                Custom orchestration layers for large-scale health organizations and multi-country distribution networks.
              </p>
              <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-6 h-auto text-lg" asChild>
                <a href="mailto:teamnevorai@gmail.com">Contact Solutions Team</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Contact Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto p-16 rounded-[4rem] bg-white border border-slate-100 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 text-center">Transparent Pricing</h2>
              <h3 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Custom solutions for your growth.
              </h3>
              <p className="text-slate-500 text-xl mb-12 font-medium">
                We believe in tailored pricing that matches your specific health ecosystem requirements. Let's discuss your vision over a call.
              </p>
              <div className="flex flex-col gap-6 items-center">
                <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 font-bold px-12 py-8 h-auto text-2xl group shadow-xl" asChild>
                  <a href="tel:+9188888888">
                    Book a Call Now <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </a>
                </Button>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Direct Contact</p>
                  <p className="text-xl font-bold text-slate-900 underline decoration-blue-500/30">teamnevorai@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Modern CTA / Final Section */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute inset-0 bg-slate-900 rounded-[4rem] transform -rotate-1 scale-[1.02] group-hover:rotate-0 transition-transform duration-700 -z-10 opacity-10" />
          <div className="relative bg-slate-900 rounded-[4rem] p-16 md:p-32 text-center overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-12 leading-[0.9]">
                Start your next health venture today.
              </h2>
              <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed font-medium">
                Everything you need to launch, scale, and manage health programs globally.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-16 py-8 bg-white text-slate-900 rounded-[2.5rem] text-2xl font-black hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center gap-4"
                >
                  Get Started for Free <ArrowRight className="w-8 h-8" />
                </Link>
                <a href="mailto:sales@healthos.com" className="text-white font-bold border-b-2 border-white/20 hover:border-white transition-all pb-1 text-lg">
                  Talk to our sales team
                </a>
              </div>
            </motion.div>

            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-blue-600 rounded-full blur-[160px] opacity-20 -mr-[20%]" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[100%] bg-indigo-600 rounded-full blur-[160px] opacity-20 -ml-[20%]" />
          </div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-20 mb-32">
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">H</div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">Health OS</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm font-medium">
                The premier infrastructure for modern health programs and wellness distribution at scale.
              </p>
              <div className="flex gap-4">
                {[Users, Globe, ShieldCheck].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all cursor-pointer">
                    <Icon className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
              {[
                { title: "Platform", links: ["Infrastructure", "Program Builder", "API Docs", "Changelog"] },
                { title: "Company", links: ["About Us", "Contact", "Privacy Policy", "Terms"] },
                { title: "Resources", links: ["Community", "Guides", "Help Center", "Status"] }
              ].map((group) => (
                <div key={group.title} className="space-y-8">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{group.title}</h5>
                  <ul className="space-y-5">
                    {group.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 text-sm font-medium">© 2026 Health OS Platform. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <Link to="/login" className="text-sm font-bold text-slate-900">Staff Portal</Link>
              <a href="/admin" className="text-sm font-bold text-slate-900">Admin Console</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}