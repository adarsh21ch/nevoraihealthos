import { createFileRoute } from '@tanstack/react-router'
import { getAppSettings } from '@/lib/tenant.functions'

export const Route = createFileRoute('/api/manifest/json')({
  server: {
    handlers: {
      GET: async () => {
        const { settings } = await getAppSettings()
        
        const brandName = settings?.brand_name || 'Fat2Fit'
        const logoUrl = (settings as any)?.logo_url || 'https://nevoraihealthos.lovable.app/__l5e/assets-v1/6707b7b1-6c3f-4fc2-8570-dac0df3e22c8/app-icon.png'
        
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
              "src": logoUrl,
              "sizes": "64x64 32x32 24x24 16x16",
              "type": logoUrl.endsWith('.ico') ? "image/x-icon" : "image/png"
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
