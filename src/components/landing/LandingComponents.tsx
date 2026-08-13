import { motion } from "framer-motion";
import { CheckCircle2, Droplets, Activity, Utensils, BarChart3, Users, Goal, Award, Plus, ChevronRight } from "lucide-react";

export const FeatureCard = ({ icon: Icon, title, description, color = "accent" }: { icon: any, title: string, description: string, color?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-accent/20 transition-all shadow-sm hover:shadow-md group"
  >
    <div className={`w-12 h-12 bg-purple-50 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-xl font-bold text-ink mb-3">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export const SectionHeader = ({ badge, title, subtitle, centered = true, id }: { badge?: string, title: string, subtitle?: string, centered?: boolean, id?: string }) => (
  <div id={id} className={`mb-16 ${centered ? 'text-center' : ''} scroll-mt-24`}>
    {badge && (
      <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-bold uppercase tracking-widest mb-6">
        {badge}
      </span>
    )}
    <h2 className={`text-4xl md:text-6xl font-bold tracking-tight text-ink mb-6 leading-tight max-w-4xl ${centered ? 'mx-auto' : ''}`}>
      {title}
    </h2>
    {subtitle && (
      <p className={`text-xl text-slate-500 max-w-2xl ${centered ? 'mx-auto' : ''} leading-relaxed`}>
        {subtitle}
      </p>
    )}
  </div>
);

export const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[3rem] h-[640px] w-[320px] shadow-2xl overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20"></div>
    <div className="h-full w-full bg-white relative z-10 overflow-y-auto">
      {children}
    </div>
  </div>
);

export const PillarCard = ({ number, title, description }: { number: number, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
  >
    <span className="absolute top-4 right-6 text-6xl font-bold text-slate-50 opacity-10 leading-none">{number}</span>
    <h4 className="text-xl font-bold text-ink mb-4 relative z-10">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed relative z-10">{description}</p>
  </motion.div>
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

