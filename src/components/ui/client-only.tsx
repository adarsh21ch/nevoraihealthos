import * as React from 'react';

export function ClientOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
