import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  ArrowRight, BarChart3, Zap, CheckCircle2, Users, Goal, Award, 
  Activity, Droplets, Utensils, Sparkles, Apple, Clock, ShieldCheck, 
  Heart, Scale, ChevronRight, MessageSquare, Plus, Star, Download
} from "lucide-react";
import { FeatureCard, SectionHeader, PhoneMockup, PillarCard, StatBox, StepIcon, ProductShowcase, DownloadSection } from "@/components/landing/LandingComponents";
import { AppLogo } from "@/components/ui/app-logo";
import { useLoaderData } from "@tanstack/react-router";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClientOnly } from "@/components/ui/client-only";

import productsAsset from "@/assets/landing/c9-products.png.asset.json";
import heroAestheticAsset from "@/assets/landing/c9-hero-aesthetic.png.asset.json";
import defaultBookletAsset from "@/assets/landing/c9-booklet.pdf.asset.json";
import { getAppSettings } from "@/lib/tenant.functions";

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

      <header className="relative pt-48 pb-36 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${heroAestheticAsset.url})` }} />
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-100/50 via-surface to-surface" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-[0.3em] mb-10 border border-emerald-200">
              9-Day Program
            </span>
            <h1 className="text-7xl md:text-[10rem] font-serif italic tracking-tighter text-ink leading-[0.8] mb-12">
              9-Day Reset. <br/><span className="relative inline-block mt-4"><span className="text-accent not-italic font-sans font-black uppercase tracking-[-0.05em]">Get Healthy.</span><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="absolute -bottom-2 left-0 right-0 h-4 bg-emerald-400/20 -z-10 origin-left" /></span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Join the elite Fat2Fit 9-day reset. A masterclass in metabolic efficiency, designed to transform your cellular energy and reveal your true vitality.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/login" className="group relative px-12 py-6 bg-ink text-white rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden">
                <span className="relative z-10">Start The Reset</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a href="#program" className="px-12 py-6 bg-white text-ink border-2 border-slate-100 rounded-2xl text-lg font-bold transition-all hover:border-accent hover:text-accent hover:shadow-xl">
                The Protocol
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader title="Stop struggling. Start thriving." subtitle="Fatigue and weight gain are often signals of a metabolic system out of balance. Our reset addresses the root cause." />
          <div className="grid md:grid-cols-3 gap-10 mt-20">
            <StatBox label="Energy Spike" value="3X" description="Natural energy without the caffeine crash." />
            <StatBox label="Mental Clarity" value="SHARP" description="Eliminate brain fog and food cravings." />
            <StatBox label="Metabolism" value="STOKED" description="Ignite your body's fat-burning potential." />
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink text-white" id="program">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader dark title="The Fat2Fit C9 Engine" subtitle="A scientifically designed 9-day plan that combines nutritional supplements, guided meal plans, and daily movement for a holistic reset." />
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
            <div className="flex gap-4 mb-12">
              <div className="flex flex-col gap-2">
                <StepIcon day={1} completed />
                <div className="w-[1px] h-8 bg-emerald-100 mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <StepIcon day={2} completed />
                <div className="w-[1px] h-8 bg-emerald-100 mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <StepIcon day={3} active />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <MessageSquare className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-bold text-ink mb-2">Direct Coaching</h4>
                <p className="text-slate-500 text-sm">Real-time feedback and support from your wellness coach.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <Star className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-bold text-ink mb-2">Milestones</h4>
                <p className="text-slate-500 text-sm">Earn badges and celebrate every victory along the 9 days.</p>
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
                  <div className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-accent uppercase tracking-wider shadow-sm">Day 3 / 9</div>
                </div>
                
                <h3 className="text-3xl font-bold text-ink mb-2 font-serif">Daily Log</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">9-Day Reset Companion</p>
                
                <div className="space-y-4">
                  {[
                    { title: 'Morning Supplements', time: '08:00 AM' },
                    { title: 'Aloe Vera Drink', time: '08:15 AM' },
                    { title: 'Light Movement', time: '10:00 AM' },
                    { title: 'Healthy Shake', time: '01:00 PM' }
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
                
                <div className="mt-8 p-6 bg-emerald-600 rounded-3xl text-white shadow-lg shadow-emerald-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Water Intake</span>
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(glass => (
                      <div key={glass} className={`h-8 flex-1 rounded-lg ${glass <= 5 ? 'bg-white' : 'bg-white/20'}`} />
                    ))}
                  </div>
                  <div className="mt-4 text-2xl font-bold">5 / 8 <span className="text-sm font-normal opacity-80">Glasses</span></div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader badge="The Program" title="How the Clean 9 Engine Works" subtitle="A synergistic 9-day system designed to reset your metabolism and build sustainable habits." />
          
          <div className="mt-20 space-y-32">
            {/* Phase 1: Reset (Days 1-2) */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                 <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-ink shadow-2xl group">
                    <div className="absolute inset-0 bg-emerald-900/40 mix-blend-overlay z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20 p-12 text-center">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/20">
                           <Zap className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-4xl font-serif italic text-white">Phase 1: The Reset</h3>
                        <p className="text-emerald-100/60 font-bold tracking-widest uppercase text-[10px]">Days 1 & 2</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-ink to-transparent">
                      <p className="text-white/80 text-sm leading-relaxed">The first two days are designed to reset your body and mind. You'll focus on cleansing and proving you can take control of your appetite.</p>
                    </div>
                 </div>
              </motion.div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(day => (
                    <div key={day} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 block">Day {day}</span>
                      <h4 className="font-bold text-ink mb-2">Metabolic Load</h4>
                      <p className="text-xs text-slate-500">Maximum caloric restriction to initiate cellular autophagy and reset cravings.</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-ink flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-accent flex items-center justify-center text-sm font-black">01</span>
                     Metabolic Cleanse
                  </h4>
                  <p className="text-slate-500 leading-relaxed">Eliminate stored toxins that prevent nutrient absorption. Feel lighter and more energized from day one.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-ink flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-accent flex items-center justify-center text-sm font-black">02</span>
                     Appetite Control
                  </h4>
                  <p className="text-slate-500 leading-relaxed">Break the cycle of cravings with a specialized supplement schedule including Garcinia Plus and Aloe Vera Gel.</p>
                </div>
              </div>
            </div>

            {/* Phase 2: Build (Days 3-9) */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-8">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[3, 4, 5, 6, 7, 8, 9].map(day => (
                    <div key={day} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
                      <span className="text-[9px] font-black uppercase text-accent">Day {day}</span>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1" />
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-accent text-white shadow-lg text-center flex flex-col items-center justify-center">
                    <Star className="w-3 h-3 mb-1" />
                    <span className="text-[9px] font-black uppercase">Goal</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-ink flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-accent flex items-center justify-center text-sm font-black">03</span>
                     Strategic Nutrition
                  </h4>
                  <p className="text-slate-500 leading-relaxed">Introduce C9-approved 600-calorie meals and high-protein shakes to support muscle maintenance and sustained energy.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-ink flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-accent flex items-center justify-center text-sm font-black">04</span>
                     Active Lifestyle
                  </h4>
                  <p className="text-slate-500 leading-relaxed">With increased caloric intake, your body is ready for moderate activity like brisk walking, swimming, or yoga.</p>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
                 <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-accent shadow-2xl group">
                    <div className="absolute inset-0 bg-ink/20 mix-blend-multiply z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-20 p-12 text-center">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/30">
                           <BarChart3 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-4xl font-serif italic text-white">Phase 2: The Build</h3>
                        <p className="text-emerald-50 font-bold tracking-widest uppercase text-[10px]">Days 3 to 9</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-emerald-900/60 to-transparent">
                      <p className="text-white text-sm leading-relaxed font-medium">Transition to sustainable habits. You'll begin to see your body change and feel your vitality return.</p>
                    </div>
                 </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-20">
            <ProductShowcase 
              image={productsAsset.url}
              title="The Synergistic C9 Kit"
              description="Each product in Clean 9 is carefully selected to work together synergistically. From metabolic support to digestive health, the kit provides everything your body needs for a complete reset."
              benefits={[
                "Forever Aloe Vera Gel: Cleanse the digestive system",
                "Forever Fiber: Promote feelings of fullness",
                "Argi+: Support healthy circulation and energy",
                "Forever Garcinia: Efficient fat burning support",
                "Forever Lite Ultra: High-quality plant protein (13g)",
                "Aloe Herbal Infusion: Relaxation and balance"
              ]}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-20">
            <FeatureCard 
              icon={Droplets} 
              title="Aloe Drinks" 
              description="Pure aloe vera to help cleanse the digestive system and maximize absorption of nutrients." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Forever Fiber" 
              description="Water-soluble fiber to promote feelings of fullness and digestive health." 
            />
            <FeatureCard 
              icon={Activity} 
              title="Forever Therm" 
              description="Botanical extracts and vitamins to support metabolism and energy levels." 
            />
            <FeatureCard 
              icon={Scale} 
              title="Forever Garcinia Plus" 
              description="Helps the body burn fat more efficiently and supports healthy appetite levels." 
            />
            <FeatureCard 
              icon={Apple} 
              title="Forever Lite Ultra" 
              description="High-protein shake mix with essential vitamins and minerals for muscle support." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Guided Support" 
              description="Comprehensive guidebook to track every step of your 9-day journey." 
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white" id="nutrition">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-ink rounded-[3.5rem] p-12 md:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
            </div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-bold uppercase tracking-widest mb-6">9-Day Protocol</span>
                <h2 className="text-4xl md:text-7xl font-serif italic text-white mb-8 leading-tight">Master your <br/>nutritional <span className="text-accent not-italic">Engine.</span></h2>
                <div className="space-y-6">
                  {[
                    "Free Foods list for guilt-free snacking.",
                    "C9-approved 600-calorie dinner recipes.",
                    "High-protein meal replacement shakes.",
                    "Natural metabolism-supporting botanicals."
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-slate-300 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
                <Link to="/login" className="inline-flex mt-12 px-8 py-4 bg-white text-ink rounded-full font-bold hover:bg-accent hover:text-white transition-all items-center gap-2">
                  View Full Meal Plan <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                    <span className="text-accent font-bold text-2xl">437</span>
                    <span className="text-white/50 text-sm">Typical Dinner Calories</span>
                  </div>
                  <div className="aspect-square rounded-3xl bg-accent p-6 flex flex-col justify-end">
                    <span className="text-white font-bold text-2xl">17g</span>
                    <span className="text-white/80 text-sm">Protein Per Shake</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                    <span className="text-accent font-bold text-2xl">9</span>
                    <span className="text-white/50 text-sm">Days to Reset</span>
                  </div>
                  <div className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end">
                    <span className="text-accent font-bold text-2xl">8+</span>
                    <span className="text-white/50 text-sm">Glasses of Water</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <DownloadSection 
            title="Download the official C9 Booklet 2026"
            subtitle="Get access to the full 9-day protocol, supplement schedules, and India-specific nutrition guides."
            pdfUrl={bookletUrl}
          />
        </div>
      </section>

      <section className="py-24 bg-slate-50" id="faq">
        <div className="max-w-3xl mx-auto px-6 text-center mb-16">
          <SectionHeader title="Expert Answers" subtitle="Everything you need to know about starting your C9 reset with confidence." />
        </div>
        <div className="max-w-3xl mx-auto px-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">What is the C9 Nutritional System?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                The C9 system is a nine-day nutritional change program designed to help you jump-start your journey to a leaner, healthier you. It combines high-quality supplements with light movement and delicious, low-calorie recipes to reset your metabolic habits.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">How much weight can I expect to lose?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                While results vary for everyone, the C9 program is designed to help contribute to weight loss, a flatter stomach, and becoming leaner by training you to make better decisions about your nutrition and daily movement.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">What can I eat during the program?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                The program includes a specific supplement schedule, high-protein shakes, and a list of 'Free Foods' (low-calorie fruits and vegetables) that can be eaten in moderation. From Day 3 onwards, you'll also enjoy a 600-calorie healthy dinner.
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
              <li><a href="#program" className="hover:text-white transition-colors">Program</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Supplements</a></li>
              <li><a href="#nutrition" className="hover:text-white transition-colors">Nutrition</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent mb-8">Resources</h4>
             <ul className="space-y-4 text-slate-400 font-bold uppercase tracking-widest text-[11px]">
              <li><a href={bookletUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">C9 Booklet</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">&copy; 2026 Fat2Fit. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
    </ClientOnly>
  );
}

export default Index;
