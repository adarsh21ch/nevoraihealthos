import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMyProfile } from "@/lib/profile/profile.functions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    title: string;
    fields: { label: string; value: any; key: string; type?: string; options?: string[] }[];
  } | null;
  profile: any;
}

export function ProfileEditDrawer({ isOpen, onClose, section, profile }: EditDrawerProps) {
  const queryClient = useQueryClient();
  const updateProfile = useServerFn(updateMyProfile);
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (section && profile) {
      const initial: Record<string, any> = {};
      section.fields.forEach(f => {
        let val = profile[f.key] ?? "";
        // Map database value back to display value for Selects
        if (f.key === 'gender' && val) {
          val = val.charAt(0).toUpperCase() + val.slice(1);
        }
        initial[f.key] = val;
      });
      setFormData(initial);
    }
  }, [section, profile]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, any>) => {
      // Data scrubbing: Convert numeric strings back to numbers for the server function
      const scrubbedData = { ...data };
      const numericFields = ['height_cm', 'weight_kg', 'waist_cm', 'target_weight_kg'];
      numericFields.forEach(field => {
        if (scrubbedData[field] && typeof scrubbedData[field] === 'string') {
          scrubbedData[field] = Number(scrubbedData[field]);
        }
      });
      
      // Allergies is an array
      if (typeof scrubbedData['allergies'] === 'string') {
        scrubbedData['allergies'] = scrubbedData['allergies'].split(',').map(s => s.trim()).filter(Boolean);
      }


      return updateProfile({ data: scrubbedData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-readiness'] });
      toast.success("Profile updated!");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  if (!section) return null;

  const renderField = (field: any) => {
    const value = formData[field.key];
    const onChange = (v: any) => setFormData(p => ({...p, [field.key]: v}));

    if (field.type === 'select' || field.options) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-ink focus:ring-0 focus:border-health-green/30 transition-all">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
            {field.options?.map((opt: string) => (
              <SelectItem key={opt} value={opt} className="rounded-xl py-3 focus:bg-emerald-50 focus:text-health-green font-bold text-sm">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 p-5 text-sm font-bold text-ink focus:ring-0 focus:border-health-green/30 transition-all resize-none"
          placeholder={`Enter ${field.label.toLowerCase()}...`}
        />
      );
    }

    return (
      <Input 
        type={field.type || 'text'}
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-ink focus:ring-0 focus:border-health-green/30 transition-all"
        placeholder={field.label}
      />
    );
  };

  const formContent = (
    <div className="mx-auto w-full max-w-md flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white px-6 pt-8 pb-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-ink">Edit {section.title}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Profile Personalization</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-ink transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      
      {/* Form Content */}
      <ScrollArea className="flex-1 px-8 py-8 h-[50vh] md:h-auto">
        <div className="space-y-8 pb-32">
          {section.fields.map(field => (
            <div key={field.key} className="space-y-3">
              <Label className="text-[11px] uppercase font-black text-ink tracking-[0.2em] ml-1">{field.label}</Label>
              <div className="relative group">
                {renderField(field)}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-focus-within:border-health-green/20 pointer-events-none transition-all" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sticky Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-100 p-8 pb-10 sm:pb-8">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => mutation.mutate(formData)} 
            disabled={mutation.isPending}
            className={cn(
              "flex-[2] h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300",
              mutation.isPending ? "bg-slate-100 text-slate-400" : "bg-health-green hover:bg-health-green/90 text-white shadow-xl shadow-health-green/20"
            )}
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Drawer */}
      <div className="md:hidden">
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent className="max-h-[92vh] border-none bg-white rounded-t-[3rem] shadow-2xl overflow-hidden">
            {formContent}
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop: Dialog (Modal) */}
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem]">
            {formContent}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}


