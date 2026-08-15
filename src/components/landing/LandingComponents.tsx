import { motion } from "framer-motion";
import { CheckCircle2, Droplets, Activity, Utensils, BarChart3, Users, Goal, Award, Plus, ChevronRight, Apple, Clock, ShieldCheck, Heart, Sparkles, Scale, Download, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const FeatureCard = ({ icon: Icon, title, description, color = "accent" }: { icon: any, title: string, description: string, color?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-200 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.1)] group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700" />
    <div className={`w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6 transition-all duration-500 relative z-10 shadow-sm shadow-emerald-100`}>
      <Icon className="w-8 h-8" />
    </div>
    <h4 className="text-2xl font-bold text-ink mb-4 relative z-10 group-hover:text-accent transition-colors">{title}</h4>
    <p className="text-slate-500 text-base leading-relaxed relative z-10 group-hover:text-slate-600 transition-colors">{description}</p>
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

export const StatBox = ({ label, value, description }: { label: string, value: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center transition-all hover:bg-white hover:shadow-xl group"
  >
    <div className="text-[12px] font-black text-accent uppercase tracking-[0.2em] mb-4 group-hover:scale-110 transition-transform">{label}</div>
    <div className="text-5xl font-black text-ink mb-4 tracking-tighter">{value}</div>
    <div className="text-base text-slate-500 font-medium leading-relaxed">{description}</div>
  </motion.div>
);

export const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto border-[12px] border-slate-900 bg-slate-900 rounded-[3.5rem] h-[700px] w-[350px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-slate-900 rounded-b-3xl z-30"></div>
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-20 overflow-hidden flex flex-col">
      {children}
    </div>
    <div className="absolute top-0 left-0 right-0 h-full w-full pointer-events-none z-40 bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
  </div>
);

export const PillarCard = ({ number, title, description, icon: Icon }: { number: number, title: string, description: string, icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: number * 0.05 }}
    className="relative p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="w-14 h-14 bg-slate-50 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:rotate-12 transition-all duration-500">
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-5xl font-black text-slate-100 group-hover:text-accent/20 transition-all duration-500 leading-none">{number}</span>
    </div>
    <h4 className="text-2xl font-bold text-ink mb-4 relative z-10 group-hover:text-accent transition-colors">{title}</h4>
    <p className="text-slate-500 text-base leading-relaxed relative z-10 group-hover:text-slate-600 transition-colors">{description}</p>
  </motion.div>
);

export const StepIcon = ({ day, active, completed }: { day: number, active?: boolean, completed?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
      active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 
      completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
    }`}>
      {completed ? <CheckCircle2 className="w-6 h-6" /> : day}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-accent' : 'text-slate-400'}`}>Day {day}</span>
  </div>
);

export const ProductShowcase = ({ image, title, description, benefits }: { image: string, title: string, description: string, benefits: string[] }) => (
  <div className="flex flex-col lg:flex-row gap-16 items-center py-20">
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="w-full lg:w-1/2 relative"
    >
      <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-3xl -z-10" />
      <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl">
        <img src={image} alt={title} className="w-full h-full object-cover p-12" />
      </div>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="w-full lg:w-1/2"
    >
      <h3 className="text-4xl md:text-5xl font-serif italic text-ink mb-8">{title}</h3>
      <p className="text-xl text-slate-500 mb-12 leading-relaxed">{description}</p>
      <div className="space-y-6">
        {benefits.map((benefit, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-lg text-slate-600 font-medium">{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export const DownloadSection = ({ title, subtitle, pdfUrl }: { title: string, subtitle: string, pdfUrl: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative p-8 md:p-20 rounded-[2.5rem] md:rounded-[3.5rem] bg-emerald-600 text-white overflow-hidden shadow-2xl shadow-emerald-200 mx-auto w-full max-w-[calc(100vw-3rem)] md:max-w-none"
  >
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-48 -mb-48" />
    
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="max-w-2xl text-center md:text-left">
        <h3 className="text-3xl md:text-5xl font-serif italic mb-6 leading-tight">{title}</h3>
        <p className="text-lg md:text-xl text-white/80 font-medium">{subtitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-10 py-6 bg-white text-emerald-700 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </a>
      </div>
    </div>
  </motion.div>
);


