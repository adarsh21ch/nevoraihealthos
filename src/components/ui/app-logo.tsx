import React from 'react';
import { useTenant } from '@/lib/tenant-context';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark';
}

export function AppLogo({ className, iconOnly = false, variant = 'dark' }: AppLogoProps) {
  const { tenant } = useTenant();
  const logoUrl = tenant?.logo_url;
  const brandName = tenant?.name || 'Fat2Fit';

  if (logoUrl) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <img 
          src={logoUrl} 
          alt={brandName} 
          className={cn(
            "object-contain",
            iconOnly ? "h-10 w-10" : "h-8 w-auto"
          )} 
        />
        {!iconOnly && (
          <span className={cn(
            "font-black text-lg tracking-tighter uppercase leading-none",
            variant === 'dark' ? "text-ink" : "text-white"
          )}>
            {brandName}
          </span>
        )}
      </div>
    );
  }

  // Fallback to default branding
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg rotate-3 shrink-0",
        variant === 'dark' ? "bg-accent shadow-purple-900/20" : "bg-white/20 shadow-black/20"
      )}>
        F2F
      </div>
      {!iconOnly && (
        <h1 className={cn(
          "text-sm font-black uppercase tracking-tight",
          variant === 'dark' ? "text-ink" : "text-white"
        )}>
          {brandName.split(/(\d+)/).map((part, i) => 
            /^\d+$/.test(part) ? <span key={i} className="text-health-green">{part}</span> : part
          )}
        </h1>
      )}
    </div>
  );
}
