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
            <div className="flex gap-4 mb-12">
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
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-10" />
            <PhoneMockup>
              <div className="p-8 bg-purple-50 h-full">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-sm">F</div>
                  <div className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-accent uppercase tracking-wider shadow-sm">Day 3 / C9</div>
                </div>
                
                <h3 className="text-3xl font-bold text-ink mb-2">Checklist</h3>
                <p className="text-slate-500 text-sm mb-8">Your goals for today.</p>
                
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
                        <CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div>
                        <div className="font-bold text-ink text-sm">{task.title}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{task.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-accent rounded-3xl text-white shadow-lg shadow-purple-200">
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

        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader badge="The Program" title="What’s inside the C9 System?" subtitle="Everything you need to reset your body and transform your nutrition over 9 powerful days." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <FeatureCard 
              icon={Droplets} 
              title="Aloe Drinks" 
              description="2X 1-liter Tetra Paks. Up to 99% pure aloe vera to help cleanse the digestive system and maximize absorption of nutrients." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Forever Fiber" 
              description="9 packets of water-soluble fiber to promote feelings of fullness and digestive health." 
            />
            <FeatureCard 
              icon={Activity} 
              title="Forever Therm" 
              description="18 tablets featuring botanical extracts and vitamins to support metabolism and energy." 
            />
            <FeatureCard 
              icon={Scale} 
              title="Forever Garcinia Plus" 
              description="54 softgels to help the body burn fat more efficiently and support healthy appetite levels." 
            />
            <FeatureCard 
              icon={Apple} 
              title="Forever Lite Ultra" 
              description="High-protein shake mix (17g per serving) with essential vitamins and minerals for muscle support." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Guided Support" 
              description="Includes a tape measure and a comprehensive guidebook to track every step of your 9-day journey." 
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-bold uppercase tracking-widest mb-6">Nutrition Focus</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">Master your daily intake.</h2>
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
                The program includes specific supplement intakes, high-protein shakes, and a list of "Free Foods" (fruits and vegetables) you can snack on. Starting from Day 3, you also enjoy structured 600-calorie meals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-none bg-white rounded-3xl px-8 py-2">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">Can I do the program more than once?</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-base leading-relaxed">
                It is recommended to repeat the C9 reset biannually (twice a year) to maintain your nutritional awareness and keep your healthy habits on track.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="py-32 bg-accent overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_white_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_white_0%,transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-10 leading-tight">Ready to start your<br />transformation?</h2>
            <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed">
              Join thousands of others who have successfully reset their health with the C9 program.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/login" className="px-12 py-6 bg-white text-accent rounded-full text-xl font-bold shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
                Start Day 1 Now
              </Link>
            </div>
          </motion.div>
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
