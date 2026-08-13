import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  ArrowRight, BarChart3, Zap, CheckCircle2, Package, Users, Goal, Award, 
  Activity, Droplets, Utensils, Sparkles, Apple, Clock, ShieldCheck, 
  Heart, Scale, ChevronRight, MessageSquare, Plus, Star
} from "lucide-react";
import { FeatureCard, SectionHeader, PhoneMockup, PillarCard, StatBox, StepIcon } from "@/components/landing/LandingComponents";
import heroAsset from "@/assets/hero_c9.pdf.asset.json";
import lifestyleAsset from "@/assets/lifestyle.pdf.asset.json";
import wellnessAsset from "@/assets/wellness.pdf.asset.json";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">F</div>
            <span className="text-xl font-bold tracking-tight text-ink">Fit to Fit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Program', 'How It Works', 'Nutrition', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[12px] font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <Link to="/login" className="px-6 py-3 bg-ink text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Start Your Journey</Link>
        </div>
      </nav>

      <header className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/50 via-white to-white" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-5 py-2 rounded-full bg-accent/10 text-accent text-sm font-bold uppercase tracking-[0.2em] mb-8">The 9-Day Reset</span>
            <h1 className="text-6xl md:text-[8rem] font-bold tracking-tighter text-ink leading-[0.9] mb-10">
              Transform your <br/><span className="text-accent italic">well-being.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed">
              Experience the premium Fit to Fit C9 system: a 9-day nutritional reset designed to kickstart your journey toward a leaner, more vibrant version of yourself.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/login" className="px-10 py-5 bg-accent text-white rounded-full text-lg font-bold shadow-lg shadow-purple-200/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                Start Your Program <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#program" className="px-10 py-5 bg-white text-ink border border-slate-200 rounded-full text-lg font-bold transition-all hover:border-accent hover:text-accent">
                Explore the C9 System
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Why Weight Matters" subtitle="It’s not just about the number on the scale. It's about vitality, clarity, and how you feel in your own body every single day." />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <StatBox label="Energy" value="300%" description="Improve your daily energy levels naturally." />
            <StatBox label="Focus" value="CLARITY" description="Clear the fog of processed food dependency." />
            <StatBox label="Balance" value="STABLE" description="Regulate your metabolism for long-term health." />
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink text-white" id="program">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader dark title="The Fit to Fit C9 Engine" subtitle="A scientifically designed 9-day plan that combines nutritional supplements, guided meal plans, and daily movement for a holistic reset." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <PillarCard number={1} title="Goal Setting" description="Start with clarity." icon={Goal} />
            <PillarCard number={2} title="Guided Intake" description="Program supplement support." icon={Activity} />
            <PillarCard number={3} title="Hydration" description="Track your 8 glasses." icon={Droplets} />
            <PillarCard number={4} title="Awareness" description="Measure your progress." icon={BarChart3} />
            <PillarCard number={5} title="Healthy Meals" description="C9-approved recipes." icon={Utensils} />
            <PillarCard number={6} title="Movement" description="Light daily activity." icon={Sparkles} />
            <PillarCard number={7} title="Coaching" description="Stay accountable." icon={Users} />
            <PillarCard number={8} title="Victory" description="Celebrate small wins." icon={Award} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <SectionHeader centered={false} badge="Daily Experience" title="Everything in your pocket." subtitle="Your daily checklist, meal tracker, hydration log, and movement goals. Stay connected with your coach and monitor your progress in real-time." />
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <StepIcon day={1} completed />
                <div className="w-[1px] h-8 bg-purple-100 mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <StepIcon day={2} completed />
                <div className="w-[1px] h-8 bg-purple-100 mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <StepIcon day={3} active />
              </div>
            </div>
          </div>
          <PhoneMockup>
            <div className="p-8 bg-purple-50 h-full">
              <div className="text-accent font-bold text-sm mb-2">Day 3 / C9</div>
              <h3 className="text-3xl font-bold text-ink mb-8">Daily Checklist</h3>
              <div className="space-y-4">
                {['Morning Supplements', 'Aloe Vera Drink', 'Light Movement', 'Healthy Shake'].map(task => (
                  <div key={task} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <CheckCircle2 className="w-6 h-6 text-purple-200" />
                    <span className="font-bold text-ink">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </PhoneMockup>
        </div>
      </section>

      <footer className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-8 shadow-xl shadow-purple-200">F</div>
          <p className="text-slate-500 mb-8">© 2026 Fit to Fit. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm font-bold text-slate-400">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Coaching</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
