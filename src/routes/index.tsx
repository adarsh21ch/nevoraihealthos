import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  ArrowRight, BarChart3, Zap, CheckCircle2, Users, Goal, Award, 
  Activity, Droplets, Utensils, Sparkles, Apple, Clock, ShieldCheck, 
  Heart, Scale, ChevronRight, MessageSquare, Plus, Star, Download
} from "lucide-react";
import { FeatureCard, SectionHeader, PhoneMockup, PillarCard, StatBox, StepIcon, ProductShowcase, DownloadSection } from "@/components/landing/LandingComponents";
import { BMITool } from "@/components/landing/BMITool";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClientOnly } from "@/components/ui/client-only";
import productsAsset from "@/assets/landing/c9-products.png.asset.json";
import heroAestheticAsset from "@/assets/landing/c9-hero-aesthetic.png.asset.json";
import defaultBookletAsset from "@/assets/landing/c9-booklet.pdf.asset.json";
import { getAppSettings } from "@/lib/tenant.functions";
import { AppLogo } from "@/components/ui/app-logo";
import { useLoaderData } from "@tanstack/react-router";


export const Route = createFileRoute("/")({
  loader: () => getAppSettings(),
  head: () => ({
    meta: [
      { title: "Fat2Fit — Your 9-Day Metabolic Reset" },
      { name: "description", content: "Fat2Fit simplifies your 9-day health journey. Track hydration, movement, and nutrition with expert guidance every step of the way." },
      { property: "og:title", content: "Fat2Fit — Your 9-Day Metabolic Reset" },
      { property: "og:description", content: "Fat2Fit simplifies your 9-day health journey. Track hydration, movement, and nutrition with expert guidance every step of the way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings } = useLoaderData({ from: '/' }) as any;
  const bookletUrl = settings?.booklet_url || defaultBookletAsset.url;

  return (
    <ClientOnly>
      <div className="flex flex-col min-h-screen bg-surface selection:bg-emerald-100">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 group cursor-pointer">
            <AppLogo />
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Program', 'How It Works', 'Nutrition', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-[12px] font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <Link to="/login" className="px-6 py-3 bg-ink text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Start Your Journey</Link>
        </div>
      </nav>

      <header className="relative pt-48 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${heroAestheticAsset.url})` }} />
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-100/50 via-surface to-surface" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-serif italic tracking-tighter text-ink leading-[0.8] mb-12 break-words sm:break-normal">
              Wellness Screening. <br/><span className="relative inline-block mt-4"><span className="text-accent not-italic font-sans font-black uppercase tracking-[-0.05em]">Start Here.</span><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="absolute -bottom-2 left-0 right-0 h-4 bg-emerald-400/20 -z-10 origin-left" /></span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Understand your metabolic baseline with our science-backed screening tool. Personalized insights for your unique health journey.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="pb-32 bg-white relative overflow-hidden">
        <BMITool />
      </section>

      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader title="Stop struggling. Start thriving." subtitle="Fatigue and weight gain are often signals of a metabolic system out of balance. Our reset addresses the root cause." />
          <div className="grid md:grid-cols-3 gap-10 mt-20">
            <FeatureCard 
              icon={Activity} 
              title="Personalized Guidance" 
              description="Customized wellness protocols tailored to your unique metabolic profile and goals." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Science-Backed" 
              description="Protocols grounded in metabolic research, focusing on sustainable energy and health." 
            />
            <FeatureCard 
              icon={Users} 
              title="Coach Support" 
              description="Dedicated guidance to keep you accountable and motivated on your journey." 
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink text-white" id="program">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader dark title="The Fit to Fit Approach" subtitle="A structured, data-driven methodology to restore metabolic balance and optimize long-term health." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <PillarCard number={1} title="Metabolic Assessment" description="Precision screening to understand your current health baseline." icon={Activity} />
            <PillarCard number={2} title="Nutritional Strategy" description="Personalized food plans designed for nutrient density and satiety." icon={Utensils} />
            <PillarCard number={3} title="Lifestyle Integration" description="Building sustainable habits that fit into your daily routine." icon={Sparkles} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <SectionHeader centered={false} badge="Daily Experience" title="Your Health OS." subtitle="A comprehensive digital companion for your wellness journey. Track your metrics, access your personalized plan, and connect with your coach in one seamless interface." />
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MessageSquare className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-bold text-ink mb-2">Expert Coaching</h4>
                <p className="text-slate-500 text-sm">Real-time feedback and professional accountability.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Activity className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-bold text-ink mb-2">Smart Tracking</h4>
                <p className="text-slate-500 text-sm">Monitor hydration, movement, and nutrition milestones.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
            <PhoneMockup>
              <div className="p-8 bg-emerald-50/50 h-full">
                <div className="flex justify-between items-center mb-8">
                  <AppLogo iconOnly className="h-10 w-11 bg-accent rounded-xl flex items-center justify-center text-white" variant="light" />
                  <div className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-accent uppercase tracking-wider shadow-sm">Daily Status</div>
                </div>
                
                <h3 className="text-3xl font-bold text-ink mb-2 font-serif">Command Center</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">Your Daily Wellness Protocol</p>
                
                <div className="space-y-4">
                  {[
                    { title: 'Nutritional Protocol', time: 'Ongoing' },
                    { title: 'Hydration Target', time: 'Current: 1.5L' },
                    { title: 'Active Minutes', time: 'Goal: 30m' },
                    { title: 'Coach Message', time: '1 New' }
                  ].map((task, i) => (
                    <motion.div 
                      key={task.title} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-accent/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                        <CheckCircle2 className="w-4 h-4 text-white opacity-100" />
                      </div>
                      <div>
                        <div className="font-bold text-ink text-sm">{task.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{task.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader badge="Methodology" title="Science-Based Results" subtitle="A structured approach to metabolic health that prioritizes long-term sustainability over quick fixes." />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-20">
            <FeatureCard 
              icon={Activity} 
              title="Metabolic Precision" 
              description="Analyze your body's specific response to nutrition and exercise." 
            />
            <FeatureCard 
              icon={Utensils} 
              title="Nutrient Density" 
              description="Focus on whole, unprocessed foods that nourish and satisfy." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Sustainable Habits" 
              description="Build a routine that lasts a lifetime, not just a few days." 
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white" id="nutrition">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-ink rounded-[3.5rem] p-12 md:p-24 overflow-hidden relative">
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-bold uppercase tracking-widest mb-6">Expert Guidance</span>
                <h2 className="text-4xl md:text-7xl font-serif italic text-white mb-8 leading-tight">Personalized <br/>Nutritional <span className="text-accent not-italic">Support.</span></h2>
                <div className="space-y-6">
                  {[
                    "Custom meal recommendations.",
                    "Personalized metabolic targets.",
                    "1-on-1 coaching support.",
                    "Science-backed habit tracking."
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-slate-300 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                    <span className="text-accent font-bold text-2xl">100%</span>
                    <span className="text-white/50 text-sm">Personalized Approach</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                    <span className="text-accent font-bold text-2xl">24/7</span>
                    <span className="text-white/50 text-sm">Coach Connectivity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50" id="faq">
        <div className="max-w-3xl mx-auto px-6 text-center mb-16">
          <SectionHeader title="Frequently Asked Questions" subtitle="Common questions about our personalized wellness approach." />
        </div>
        <div className="max-w-3xl mx-auto px-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">What is the Fit to Fit program?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                Fit to Fit is a comprehensive wellness ecosystem that combines data-driven tracking with personalized metabolic coaching to help you achieve sustainable health results.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">Is this a weight loss program?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                While many participants see weight loss, our primary focus is metabolic health, energy levels, and building sustainable lifestyle habits that lead to long-term well-being.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      
      <footer className="bg-ink text-white py-20 px-6">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <AppLogo variant="light" />
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed font-medium">Empowering your journey to peak metabolic health through science and community.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent mb-8">Navigation</h4>
            <ul className="space-y-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
              <li><a href="#methodology" className="hover:text-white transition-colors">Methodology</a></li>
              <li><a href="#command-center" className="hover:text-white transition-colors">Command Center</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent mb-8">Resources</h4>
             <ul className="space-y-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">&copy; 2026 Fat2Fit. All Rights Reserved.</p>
          {/* Affiliation moved to App layouts only */}
        </div>
      </footer>
    </div>
    </ClientOnly>
  );
}

export default Index;
