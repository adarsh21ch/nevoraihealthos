import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { createServerFn } from "@tanstack/react-start";
import { resolveTenantHint } from "@/lib/tenant";
import { getTenantByHint } from "@/lib/tenant.functions";
import { TenantProvider } from "@/lib/tenant-context";
import { TenantGate } from "@/components/site/TenantGate";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const getRequestInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  if (!request) return { hostname: "", pathname: "", search: "" };
  const url = new URL(request.url);
  return {
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
  };
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  tenant: any;
  isCustomDomain: boolean;
}>()({
  loader: async ({ context }) => {
    try {
      const info = await getRequestInfo();
      const hint = resolveTenantHint(info);
      
      let tenant = null;
      if (hint) {
        const result = await getTenantByHint({ data: hint });
        tenant = result.tenant;
      }
      
      return {
        tenant,
        isCustomDomain: hint?.mode === 'domain',
      };
    } catch (error) {
      console.error("Root loader failed:", error);
      return {
        tenant: null,
        isCustomDomain: false,
      };
    }
  },
  head: ({ loaderData }) => {
    const brandName = loaderData?.tenant?.name || 'Fat2Fit';
    const logoUrl = loaderData?.tenant?.logo_url || '/favicon.ico';
    
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" },
        { name: "theme-color", content: "#064E3B" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: brandName },
        { title: `${brandName} | 9-Day Reset Protocol` },
        { name: "description", content: "Simplified metabolic wellness for your 9-day journey." },
        { name: "author", content: "Nevorai" },
        { property: "og:title", content: `${brandName} | Personalized Health Program` },
        { property: "og:description", content: `Personalized infrastructure for your ${brandName} wellness journey.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: `@${brandName}` },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800&display=swap" },
        { rel: "icon", href: logoUrl, type: logoUrl.endsWith('.ico') ? "image/x-icon" : "image/png" },
        { rel: "manifest", href: "/api/manifest" },
        { rel: "apple-touch-icon", href: logoUrl },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { tenant, isCustomDomain } = Route.useLoaderData();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW error:', err));
    }
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider tenant={tenant as any} isCustomDomain={isCustomDomain}>
        <TenantGate isPlatformPage={!isCustomDomain && !tenant}>
          <Outlet />
          <PWAInstallPrompt />
        </TenantGate>
      </TenantProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

