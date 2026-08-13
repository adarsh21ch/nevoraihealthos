import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Zap, CheckCircle2, Package, Users, Goal, Award } from "lucide-react";
import { FeatureCard, SectionHeader, PhoneMockup } from "@/components/landing/LandingComponents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fit to Fit — Your 9-Day C9 Wellness Journey" },
      { name: "description", content: "Fit to Fit brings your C9 wellness journey into one simple experience with guided daily activities, nutrition, hydration, movement, progress tracking and coach accountability." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-surface selection:bg-purple-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">F</div>
            <span className="text-xl font-bold tracking-tight text-ink">Fit to Fit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Program', 'How It Works', 'Nutrition', 'FAQ'].map(item => (
              <a key={item} href="#" className="text-[12px] font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-3 bg-ink text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Start Your Journey</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-[8rem] font-bold tracking-tighter text-ink leading-[0.9] mb-10"
        >
          Your 9-day reset.<br/>
          <span className="text-accent">One simple plan.</span>
        </motion.h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Follow a structured C9 wellness journey with guided nutrition, hydration, movement and daily accountability — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="px-10 py-5 bg-accent text-white rounded-full text-lg font-bold shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
            START YOUR C9 JOURNEY <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#how-it-works" className="px-10 py-5 text-ink font-bold hover:text-accent transition-all">Explore the program</a>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Most people don't need more information. They need a plan they can actually follow." />
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {[
              { title: "Too Much Information", text: "Conflicting advice makes healthy choices difficult to follow consistently." },
              { title: "No Clear Daily Plan", text: "Knowing what to do is different from knowing what to do TODAY." },
              { title: "No Accountability", text: "Without tracking or support, consistency becomes difficult." },
              { title: "No Progress Visibility", text: "If you don't track the journey, you don't see how habits change." }
            ].map((p, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-3xl">
                <h4 className="text-2xl font-bold text-ink mb-4">{p.title}</h4>
                <p className="text-slate-600 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Fit to Fit */}
      <section className="py-24 bg-purple-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Meet Fit to Fit." subtitle="Fit to Fit is a digital wellness platform designed to make a structured C9 journey easier to follow, understand and track." />
          <div className="grid md:grid-cols-4 gap-6">
            <FeatureCard icon={Goal} title="Plan" description="Know what your day looks like." />
            <FeatureCard icon={CheckCircle2} title="Follow" description="Complete your daily program." />
            <FeatureCard icon={BarChart3} title="Track" description="See your progress." />
            <FeatureCard icon={Users} title="Connect" description="Stay accountable with your coach." />
          </div>
        </div>
      </section>

      {/* Daily Experience */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-5xl font-bold tracking-tight text-ink mb-8 leading-tight">Open Fit to Fit.<br/>Know exactly what to do.</h2>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed">No more guessing. Every task, recipe, and measurement is right in your pocket. Track your daily habits, see how you're feeling, and stay connected with your program coach.</p>
            <Link to="/login" className="px-8 py-4 bg-accent text-white rounded-full text-lg font-bold shadow-lg">Start your 9-day reset</Link>
          </div>
          <div className="flex-1 flex justify-center">
            <PhoneMockup>
              <div className="p-6">
                <div className="text-xs font-bold text-slate-400 mb-2">GOOD MORNING</div>
                <div className="text-2xl font-bold mb-6">Day 4 of 9</div>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-2xl flex justify-between items-center"><span className="font-bold text-accent">Morning Nutrition</span><CheckCircle2 className="text-accent" /></div>
                  <div className="p-4 bg-slate-50 rounded-2xl">Hydration: 5/8</div>
                  <div className="p-4 bg-slate-50 rounded-2xl">Movement: 18/30m</div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-ink text-white text-center">
        <p className="text-slate-400">© 2026 Fit to Fit. All rights reserved.</p>
      </footer>
    </div>
  );
}

