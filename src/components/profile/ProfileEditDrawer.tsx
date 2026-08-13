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

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    title: string;
    fields: { label: string; value: any; key: string }[];
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
    mutationFn: (data: Record<string, any>) => updateProfile({ data }),
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Edit {section.title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto">
          {section.fields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-slate-400">{field.label}</Label>
              {field.key === 'gender' ? (
                 <Select value={formData[field.key]} onValueChange={v => setFormData(p => ({...p, [field.key]: v}))}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Male">Male</SelectItem>
                     <SelectItem value="Female">Female</SelectItem>
                     <SelectItem value="Other">Other</SelectItem>
                   </SelectContent>
                 </Select>
              ) : field.key === 'health_concerns' ? (
                <Textarea 
                  value={formData[field.key]} 
                  onChange={e => setFormData(p => ({...p, [field.key]: e.target.value}))}
                />
              ) : (
                <Input 
                  value={formData[field.key]} 
                  onChange={e => setFormData(p => ({...p, [field.key]: e.target.value}))}
                />
              )}
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
