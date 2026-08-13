import { useEffect, useState, ReactNode } from 'react';

export function ClientOnly({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
