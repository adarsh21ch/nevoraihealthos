import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Search,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/media')({
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('public-assets-v2')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'desc' }
        });
      
      if (error) throw error;
      return data || [];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('public-assets-v2')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        });

      if (error) throw error;
      return fileName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('File uploaded successfully');
      setUploading(false);
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('public-assets-v2')
        .remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('File deleted');
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const getFileUrl = (name: string) => {
    const { data } = supabase.storage.from('public-assets-v2').getPublicUrl(name);
    return data.publicUrl;
  };

  const filteredFiles = files?.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-ink">Media Library</h1>
          <p className="text-slate-500 mt-2">Manage public assets for products and resources.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl w-64"
            />
          </div>
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 bg-health-green text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload File
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
              accept="image/*,application/pdf"
            />
          </label>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredFiles?.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No media found. Upload your first asset above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredFiles?.map((file) => {
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
            const url = getFileUrl(file.name);
            
            return (
              <div key={file.id} className="group relative aspect-square bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {isImage ? (
                  <img src={url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50">
                    <File className="w-10 h-10 text-slate-300" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2 truncate w-full text-center">{file.name}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-8"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    Copy URL
                  </Button>
                  <div className="flex gap-2 w-full">
                    <Button 
                      asChild
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 rounded-xl h-8"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1 rounded-xl h-8"
                      onClick={() => deleteMutation.mutate(file.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
