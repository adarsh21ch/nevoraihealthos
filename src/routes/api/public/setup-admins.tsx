import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ensureAdminAccount } from '@/lib/admin-setup.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppLogo } from '@/components/ui/app-logo';

export const Route = createFileRoute('/api/public/setup-admins')({
  component: SetupAdminsPage,
});

function SetupAdminsPage() {
  const setupFn = useServerFn(ensureAdminAccount);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const runSetup = async () => {
    setLoading(true);
    const admins = [
      { email: 'krishnaaroraflp@gmail.com', name: 'Krishna Arora', pass: 'Fat@8888' },
      { email: 'teamnevorai@gmail.com', name: 'Team Nevorai', pass: 'Fat@8888' }
    ];

    const newResults: string[] = [];
    
    for (const admin of admins) {
      try {
        await setupFn({ 
          data: { 
            email: admin.email, 
            password: admin.pass, 
            name: admin.name 
          } 
        });
        newResults.push(`✅ Successfully set up ${admin.email}`);
        toast.success(`Set up ${admin.email}`);
      } catch (e: any) {
        console.error(e);
        newResults.push(`❌ Failed ${admin.email}: ${e.message}`);
        toast.error(`Failed ${admin.email}`);
      }
    }
    
    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-health-green">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-12" />
          </div>
          <CardTitle className="text-2xl font-serif text-emerald-900">Admin Production Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-600 text-center">
            This utility will ensure the requested platform admin accounts are created or updated with the correct roles and credentials.
          </p>

          <Button 
            onClick={runSetup} 
            disabled={loading}
            className="w-full h-12 text-lg bg-emerald-800 hover:bg-emerald-900"
          >
            {loading ? "Running Setup..." : "Execute Admin Setup"}
          </Button>

          {results.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 font-mono text-sm space-y-2">
              {results.map((res, i) => (
                <div key={i}>{res}</div>
              ))}
              <div className="pt-4 border-t border-slate-100 text-center">
                <a href="/login" className="text-emerald-700 hover:underline">Go to Login</a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
