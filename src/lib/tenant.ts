/**
 * Tenant resolution engine for Health OS
 * Ported from Academy OS pattern
 */

export const RESERVED_HOSTS = [
  'healthos',
  'www',
  'app',
  'api',
  'admin',
  'flow',
  'academy',
];

export const PLATFORM_BASE_HOSTS = [
  'nevorai.com',
  'localhost',
  '127.0.0.1',
  'lovable.app',
  'lovable.dev',
  'lovableproject.com',
  'lovable-preview.com',
];

/**
 * Checks if a hostname is a reserved platform host (e.g. main site, previews)
 */
export function isReservedPlatformHost(hostname: string): boolean {
  if (!hostname) return true;
  
  // Exact match for base domains
  if (PLATFORM_BASE_HOSTS.includes(hostname)) return true;
  
  // Lovable previews: id-preview--..., labels containing --, or 36 char IDs
  if (hostname.includes('--')) return true;
  if (hostname.startsWith('id-preview')) return true;
  
  const labels = hostname.split('.');
  const firstLabel = labels[0];
  
  if (!firstLabel) return true;

  // 36 char UUID-like labels
  if (firstLabel.length === 36) return true;
  
  // Reserved subdomains on platform domains
  const isPlatformDomain = PLATFORM_BASE_HOSTS.some(base => hostname.endsWith(`.${base}`));
  if (isPlatformDomain && RESERVED_HOSTS.includes(firstLabel)) return true;
  
  return false;
}

export type TenantHint = {
  mode: 'domain' | 'slug';
  value: string;
} | null;

/**
 * Resolves a tenant hint from the current request context
 */
export function resolveTenantHint({ 
  hostname, 
  pathname, 
  search 
}: { 
  hostname: string; 
  pathname: string; 
  search: string;
}): TenantHint {
  const params = new URLSearchParams(search);
  
  // 1. ?tenant=slug query param (highest priority for local testing)
  const queryTenant = params.get('tenant');
  if (queryTenant) return { mode: 'slug', value: queryTenant };
  
  // 2. Path /p/{slug}
  if (pathname.startsWith('/p/')) {
    const parts = pathname.split('/');
    if (parts[2]) return { mode: 'slug', value: parts[2] };
  }
  
  // 3. Reserved platform host -> No tenant resolution from hostname
  if (isReservedPlatformHost(hostname)) return null;
  
  // 4. {slug}.nevorai.com subdomain
  if (hostname.endsWith('.nevorai.com')) {
    const slug = hostname.replace('.nevorai.com', '');
    if (slug && !RESERVED_HOSTS.includes(slug)) {
      return { mode: 'slug', value: slug };
    }
  }
  
  // 5. External hostname -> custom domain
  return { mode: 'domain', value: hostname };
}

/**
 * Generates the canonical live URL for a tenant
 */
export function tenantSiteUrl(
  tenant: { slug: string; custom_domain?: string | null }, 
  currentOrigin: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  if (tenant.custom_domain) {
    return `https://${tenant.custom_domain}`;
  }
  
  // If we're on a platform domain, use the subdomain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname && (hostname.endsWith('.nevorai.com') || hostname === 'nevorai.com')) {
    return `https://${tenant.slug}.nevorai.com`;
  }
  
  // Fallback for local dev / previews
  const url = new URL(currentOrigin);
  url.searchParams.set('tenant', tenant.slug);
  url.pathname = '/';
  return url.toString();
}
