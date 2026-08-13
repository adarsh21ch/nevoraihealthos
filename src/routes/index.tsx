import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Zap, CheckCircle2, Package, Users, Goal, Award } from "lucide-react";
import { FeatureCard, SectionHeader, PhoneMockup, PillarCard } from "@/components/landing/LandingComponents";
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

      <header className="pt-40 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-[8rem] font-bold tracking-tighter text-ink leading-[0.9] mb-10">
          Your 9-day reset.<br/><span className="text-accent">One simple plan.</span>
        </motion.h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">Follow a structured C9 wellness journey with guided nutrition, hydration, movement and daily accountability — all in one place.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="px-10 py-5 bg-accent text-white rounded-full text-lg font-bold shadow-lg shadow-purple-200 transition-all flex items-center gap-2">START YOUR C9 JOURNEY <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </header>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Most people don't need more information. They need a plan they can actually follow." />
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {[{title: "Too Much Information", text: "Conflicting advice makes healthy choices difficult."}, {title: "No Clear Daily Plan", text: "Knowing what to do is different from knowing what to do TODAY."}, {title: "No Accountability", text: "Without tracking, consistency becomes difficult."}, {title: "No Progress Visibility", text: "Tracking is essential to see how habits change."}].map((p, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-3xl"><h4 className="text-2xl font-bold text-ink mb-4">{p.title}</h4><p className="text-slate-600">{p.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50" id="program">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Everything your journey needs." />
          <div className="grid md:grid-cols-4 gap-6">
            <PillarCard number={1} title="Set a Goal" description="Define your path." />
            <PillarCard number={2} title="Guided Intake" description="Program supplement support." />
            <PillarCard number={3} title="Proper Hydration" description="Track every glass." />
            <PillarCard number={4} title="Body Awareness" description="Measure and track." />
            <PillarCard number={5} title="Healthy Recipes" description="C9-approved meals." />
            <PillarCard number={6} title="Light Movement" description="Stay active daily." />
            <PillarCard number={7} title="Share Experience" description="Connect with your coach." />
            <PillarCard number={8} title="Celebrate" description="Review your journey." />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader title="Frequently asked questions" />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1"><AccordionTrigger>What is Fit to Fit?</AccordionTrigger><AccordionContent>A platform to digitize the C9 journey.</AccordionContent></AccordionItem>
            <AccordionItem value="item-2"><AccordionTrigger>How long is the program?</AccordionTrigger><AccordionContent>The C9 experience is 9 days long.</AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </section>

      <footer className="py-20 bg-ink text-white text-center">
        <p className="text-slate-400">© 2026 Fit to Fit. All rights reserved.</p>
      </footer>
    </div>
  );
}
