import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Check, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAppSettings } from "@/lib/tenant.functions";
import { updateBranding } from "@/lib/admin-settings.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BrandingSettings() {
  const queryClient = useQueryClient();
  const getSettingsFn = useServerFn(getAppSettings);
  const updateBrandingFn = useServerFn(updateBranding);
  
  const [uploading, setUploading] = useState(false);
  const [uploadingBooklet, setUploadingBooklet] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => getSettingsFn(),
  });

  const settings = settingsData?.settings;

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateBrandingFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success("Branding updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update branding: " + error.message);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, WebP or SVG.");
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      await updateMutation.mutateAsync({ logoUrl: publicUrl });
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    await updateMutation.mutateAsync({ logoUrl: null });
  };

  const handleBookletUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Invalid file type. Please upload a PDF.");
      return;
    }

    setUploadingBooklet(true);
    try {
      const fileName = `c9-booklet-${Math.random().toString(36).substring(7)}.pdf`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      await updateMutation.mutateAsync({ bookletUrl: publicUrl });
    } catch (error: any) {
      toast.error("Booklet upload failed: " + error.message);
    } finally {
      setUploadingBooklet(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="border-slate-200 rounded-[2.5rem] shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-ink">Application Branding</CardTitle>
            <p className="text-sm text-slate-500 font-medium">Manage your application's visual identity and logos.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Current Logo</Label>
              <div className="h-40 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex items-center justify-center p-8 relative overflow-hidden group">
                {settings?.logo_url ? (
                  <>
                    <img 
                      src={settings.logo_url} 
                      alt="Current Logo" 
                      className="max-h-full max-w-full object-contain drop-shadow-sm" 
                    />
                    <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={handleRemoveLogo}
                        disabled={updateMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" /> Remove Logo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <div className="w-12 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                       <span className="font-black text-[10px]">F2F</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Default Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Upload New Logo</Label>
              <div className="relative">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  disabled={uploading || updateMutation.isPending}
                  className="hidden" 
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32 rounded-3xl border-2 border-dashed border-slate-200 bg-white hover:border-accent hover:bg-slate-50 transition-all cursor-pointer",
                    (uploading || updateMutation.isPending) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {uploading || updateMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-ink">Click to upload or drag & drop</span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">PNG, SVG or WebP (Max 2MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-4">
               <Label htmlFor="brandName" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Brand Name</Label>
               <Input 
                 id="brandName" 
                 defaultValue={settings?.brand_name}
                 placeholder="Fat2Fit"
                 className="h-12 rounded-2xl border-slate-200"
                 onBlur={(e) => {
                   if (e.target.value !== settings?.brand_name) {
                     updateMutation.mutate({ brandName: e.target.value });
                   }
                 }}
               />
             </div>
             <div className="space-y-4">
               <Label htmlFor="tagline" className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tagline</Label>
               <Input 
                 id="tagline" 
                 defaultValue={settings?.tagline}
                 placeholder="Your 9-day reset, guided day by day."
                 className="h-12 rounded-2xl border-slate-200"
                 onBlur={(e) => {
                  if (e.target.value !== settings?.tagline) {
                    updateMutation.mutate({ tagline: e.target.value });
                  }
                }}
               />
             </div>

             <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
               <h4 className="text-xs font-black uppercase tracking-widest text-ink mb-3 flex items-center gap-2">
                 <Check className="w-3 h-3 text-health-green" /> Branding Info
               </h4>
               <ul className="space-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                 <li>• Logo propagates to sidebar, login, and loading screens.</li>
                 <li>• PWA manifest icons update dynamically.</li>
                 <li>• Maintain high-resolution square assets for best PWA results.</li>
                 <li>• Fallback to "F2F" identity if no logo is provided.</li>
               </ul>
             </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Resource Management</h3>
              <p className="text-sm text-slate-500 font-medium">Upload official guides and booklets for participants.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Official Protocol Booklet (PDF)</Label>
              <div className="flex flex-col gap-4">
                {settings?.booklet_url && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-ink truncate max-w-[200px]">Program Booklet 2026.pdf</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Resource</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => updateMutation.mutate({ bookletUrl: null })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <Input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleBookletUpload}
                    disabled={uploadingBooklet || updateMutation.isPending}
                    className="hidden" 
                    id="booklet-upload"
                  />
                  <label 
                    htmlFor="booklet-upload"
                    className={cn(
                      "flex items-center justify-center w-full h-24 rounded-3xl border-2 border-dashed border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer gap-3",
                      (uploadingBooklet || updateMutation.isPending) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {uploadingBooklet ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-bold text-ink">Upload Booklet PDF</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-[2.5rem] p-8 flex flex-col justify-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900 mb-3">Public Access</h4>
              <p className="text-xs text-emerald-800/70 font-medium leading-relaxed">
                The uploaded booklet will be automatically available for download on the public landing page and within the participant's Kit and Profile tabs.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
