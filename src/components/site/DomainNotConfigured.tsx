import { Link } from '@tanstack/react-router';
import { Globe } from 'lucide-react';

export function DomainNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FCFBF8] text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <Globe className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Domain Not Configured</h1>
          <p className="text-slate-500">
            This domain isn't connected to a Fat2Fit site yet.
          </p>
        </div>
        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Return to Fat2Fit
          </Link>
        </div>
      </div>
    </div>
  );
}
