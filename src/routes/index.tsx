import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, CheckCircle2, Zap, BarChart3, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fit to Fit | Your 9-Day Reset" },
      { name: "description", content: "A guided 9-day wellness experience designed to help participants build better nutrition, hydration, movement and daily habits." },
      { property: "og:title", content: "Fit to Fit | Your 9-Day Reset" },
      { property: "og:description", content: "Follow your daily C9 schedule, stay on top of hydration and movement, track your progress, and stay accountable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-surface selection:bg-purple-100 selection:text-purple-900">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/50 backdrop-blur-2xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">F</div>
            <span className="text-xl font-bold tracking-tight text-ink">Fit to Fit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Program', 'How It Works', 'Nutrition', 'Movement', 'FAQ'].map(item => (
              <a key={item} href="#" className="text-[12px] font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-ink">Login</Link>
            <Link to="/login" className="px-6 py-3 bg-ink text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
              Start Your Journey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <header className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-[8rem] font-bold tracking-tighter text-ink leading-[0.9] mb-10"
        >
          Your 9-day reset.<br/>
          <span className="text-accent">One simple plan.</span>
        </motion.h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Follow your daily C9 schedule, stay on top of hydration and movement, track your progress, and stay accountable from Day 1 through completion.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="px-10 py-5 bg-accent text-white rounded-full text-lg font-bold shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
            Start Your C9 Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Program Pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-6">
          {[
            { title: "Set a Goal", icon: <BarChart3 /> },
            { title: "Guided Intake", icon: <Zap /> },
            { title: "Hydration", icon: <CheckCircle2 /> },
            { title: "Movement", icon: <Package /> }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
              <h4 className="text-xl font-bold text-ink">{item.title}</h4>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
