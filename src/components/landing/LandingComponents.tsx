import { motion } from "framer-motion";
import { CheckCircle2, Droplets, Activity, Utensils, BarChart3, Users, Goal, Award } from "lucide-react";

export const FeatureCard = ({ icon: Icon, title, description, color = "accent" }: { icon: any, title: string, description: string, color?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-accent/20 transition-all shadow-sm hover:shadow-md"
  >
    <div className={`w-12 h-12 bg-${color}/10 text-${color} rounded-2xl flex items-center justify-center mb-6`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-xl font-bold text-ink mb-3">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export const SectionHeader = ({ badge, title, subtitle, centered = true }: { badge?: string, title: string, subtitle?: string, centered?: boolean }) => (
  <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
    {badge && (
      <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-bold uppercase tracking-widest mb-6">
        {badge}
      </span>
    )}
    <h2 className={`text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6 leading-tight`}>
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
  <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
    <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
    <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
    <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">
      {children}
    </div>
  </div>
);
