import React, { createContext, useContext, ReactNode } from 'react';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  tagline: string | null;
  whatsapp: string | null;
  custom_domain: string | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  isCustomDomain: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children, 
  tenant, 
  isLoading = false,
  isCustomDomain = false
}: { 
  children: ReactNode; 
  tenant: Tenant | null; 
  isLoading?: boolean;
  isCustomDomain?: boolean;
}) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading, isCustomDomain }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
