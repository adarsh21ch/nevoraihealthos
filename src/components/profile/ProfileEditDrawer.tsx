import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
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
        initial[f.key] = profile[f.key] ?? "";
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
      if (typeof scrubbedData.allergies === 'string') {
        scrubbedData.allergies = scrubbedData.allergies.split(',').map(s => s.trim()).filter(Boolean);
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
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt: string) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
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
          className="min-h-[100px] rounded-xl"
        />
      );
    }

    return (
      <Input 
        type={field.type || 'text'}
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="h-12 rounded-xl"
        placeholder={field.label}
      />
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-md flex flex-col h-full">
          <DrawerHeader className="border-b border-slate-50">
            <DrawerTitle className="text-2xl font-serif italic text-ink">Edit {section.title}</DrawerTitle>
          </DrawerHeader>
          
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6 pb-8">
              {section.fields.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t border-slate-50 p-6">
            <Button 
              onClick={() => mutation.mutate(formData)} 
              disabled={mutation.isPending}
              className="h-14 rounded-2xl bg-health-green hover:bg-health-green/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-health-green/20"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={onClose} className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

