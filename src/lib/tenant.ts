/**
 * Fat2Fit App Configuration
 * Ported from multi-tenant Health OS to dedicated Fat2Fit
 */

export const RESERVED_HOSTS = [
  'www',
  'app',
  'api',
  'admin',
];

export const PLATFORM_BASE_HOSTS = [
  'nevorai.com',
  'localhost',
  '127.0.0.1',
  'lovable.app',
  'lovable.dev',
];

/**
 * Checks if a hostname is a reserved platform host
 */
export function isReservedPlatformHost(hostname: string): boolean {
  if (!hostname) return true;
  
  if (PLATFORM_BASE_HOSTS.includes(hostname)) return true;
  if (hostname.includes('--')) return true;
  
  const labels = hostname.split('.');
  const firstLabel = labels[0];
  if (!firstLabel) return true;

  if (firstLabel.length === 36) return true;
  
  const isPlatformDomain = PLATFORM_BASE_HOSTS.some(base => hostname.endsWith(`.${base}`));
  if (isPlatformDomain && RESERVED_HOSTS.includes(firstLabel)) return true;
  
  return false;
}

export type AppConfigHint = {
  brand: string;
} | null;

/**
 * Resolves app context
 */
export function resolveAppConfig(): AppConfigHint {
  return { brand: 'Fat2Fit' };
}
