import { ReactNode } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { DomainNotConfigured } from './DomainNotConfigured';

interface TenantGateProps {
  children: ReactNode;
  /**
   * If true, this component will render its children even if no tenant is present.
   * Useful for platform-level pages like the main landing page or admin.
   */
  isPlatformPage?: boolean;
}

export function TenantGate({ children, isPlatformPage = false }: TenantGateProps) {
  const { tenant, isLoading, isCustomDomain } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  // If it's a platform page, we always show it
  if (isPlatformPage) {
    return <>{children}</>;
  }

  // If we are on a custom domain/subdomain but no tenant was found
  if (isCustomDomain && !tenant) {
    return <DomainNotConfigured />;
  }

  // Otherwise, show children (this could be the platform site or the tenant site)
  return <>{children}</>;
}
