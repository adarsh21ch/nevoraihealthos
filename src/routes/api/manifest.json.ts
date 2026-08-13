import { createFileRoute } from '@tanstack/react-router'
import { getAppSettings } from '@/lib/tenant.functions'

export const Route = createFileRoute('/api/manifest/json')({
  server: {
    handlers: {
      GET: async () => {
        const { settings } = await getAppSettings()
        
        const brandName = settings?.brand_name || 'Fat2Fit'
        const logoUrl = (settings as any)?.logo_url || 'https://nevoraihealthos.lovable.app/lovable-uploads/67a99f36-3b1a-4d2d-88b1-389d311394a5.png'
        
        const manifest = {
          "name": brandName,
          "short_name": brandName,
          "description": settings?.tagline || "Your 9-Day Metabolic Reset Protocol.",
          "start_url": "/",
          "display": "standalone",
          "background_color": "#F8FAFC",
          "theme_color": "#064E3B",
          "orientation": "portrait",
          "icons": [
            {
              "src": "/favicon.ico",
              "sizes": "64x64 32x32 24x24 16x16",
              "type": "image/x-icon"
            },
            {
              "src": logoUrl,
              "sizes": "192x192",
              "type": "image/png",
              "purpose": "any maskable"
            },
            {
              "src": logoUrl,
              "sizes": "512x512",
              "type": "image/png"
            }
          ],
          "id": "com.nevorai.fat2fit",
          "scope": "/"
        }

        return new Response(JSON.stringify(manifest), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      }
    }
  }
})
