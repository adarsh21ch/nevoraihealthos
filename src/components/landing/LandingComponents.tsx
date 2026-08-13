import { motion } from "framer-motion";
import { CheckCircle2, Droplets, Activity, Utensils, BarChart3, Users, Goal, Award, Plus, ChevronRight, Apple, Clock, ShieldCheck, Heart, Sparkles, Scale } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const FeatureCard = ({ icon: Icon, title, description, color = "accent" }: { icon: any, title: string, description: string, color?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-accent/30 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(124,58,237,0.08)] group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
    <div className={`w-16 h-16 bg-purple-50 text-accent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10`}>
      <Icon className="w-8 h-8" />
    </div>
    <h4 className="text-2xl font-bold text-ink mb-4 relative z-10">{title}</h4>
    <p className="text-slate-500 text-base leading-relaxed relative z-10">{description}</p>
  </motion.div>
);

export const SectionHeader = ({ badge, title, subtitle, centered = true, id, dark = false }: { badge?: string, title: string, subtitle?: string, centered?: boolean, id?: string, dark?: boolean }) => (
  <div id={id} className={`mb-20 ${centered ? 'text-center' : ''} scroll-mt-24`}>
    {badge && (
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-block px-5 py-2 rounded-full bg-accent/10 text-accent text-[12px] font-bold uppercase tracking-[0.2em] mb-8"
      >
        {badge}
      </motion.span>
    )}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] max-w-5xl ${centered ? 'mx-auto' : ''} ${dark ? 'text-white' : 'text-ink'}`}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-xl md:text-2xl max-w-3xl ${centered ? 'mx-auto' : ''} leading-relaxed font-medium ${dark ? 'text-slate-300' : 'text-slate-500'}`}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

export const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto border-[12px] border-slate-900 bg-slate-900 rounded-[3.5rem] h-[700px] w-[350px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-slate-900 rounded-b-3xl z-30"></div>
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-20 overflow-hidden flex flex-col">
      {children}
    </div>
    {/* Screen Glare */}
    <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none z-40 bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
  </div>
);

export const PillarCard = ({ number, title, description, icon: Icon }: { number: number, title: string, description: string, icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: number * 0.05 }}
    className="relative p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
  >
    <div className="flex justify-between items-start mb-8">
      <div className="w-14 h-14 bg-slate-50 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-5xl font-black text-slate-100 group-hover:text-accent/10 transition-colors leading-none">{number}</span>
    </div>
    <h4 className="text-2xl font-bold text-ink mb-4">{title}</h4>
    <p className="text-slate-500 text-base leading-relaxed">{description}</p>
  </motion.div>
);

export const StatBox = ({ label, value, description }: { label: string, value: string, description: string }) => (
  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center">
    <div className="text-[12px] font-bold text-accent uppercase tracking-widest mb-2">{label}</div>
    <div className="text-4xl font-bold text-ink mb-2">{value}</div>
    <div className="text-sm text-slate-500">{description}</div>
  </div>
);

export const StepIcon = ({ day, active, completed }: { day: number, active?: boolean, completed?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
      active ? 'bg-accent text-white shadow-lg shadow-purple-200' : 
      completed ? 'bg-purple-100 text-accent' : 'bg-slate-50 text-slate-400'
    }`}>
      {completed ? <CheckCircle2 className="w-6 h-6" /> : day}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-accent' : 'text-slate-400'}`}>Day {day}</span>
  </div>
);
