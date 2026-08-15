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

