import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera, User, Phone, Mail, Info } from "lucide-react";

const ProfileSettings = () => {
  const { user, updateProfile, uploadAvatar } = useApp();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: formData.name,
      phone: formData.phone,
      bio: formData.bio,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    }
    setIsSaving(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const { error } = await uploadAvatar(file);
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-3d card-3d">
        <div className="relative group">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring-4 ring-background shadow-xl gradient-navy text-2xl font-bold text-primary-foreground font-body transition-transform group-hover:scale-105">
            {user?.avatar?.length && user.avatar.length > 2 ? (
              <img src={user.avatar} alt={user.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="h-full w-full object-cover" />
            ) : (
              <span>{user?.avatar || "GU"}</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground font-body">{user?.name}</h3>
          <p className="text-xs text-muted-foreground font-body capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
              <User className="h-4 w-4 text-primary" /> Full Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="rounded-xl border-border bg-background focus:ring-primary/20 font-body"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
              <Mail className="h-4 w-4 text-primary" /> Email Address
            </label>
            <Input
              value={user?.email || ""}
              readOnly
              className="rounded-xl border-border bg-muted/50 cursor-not-allowed font-body"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
              <Phone className="h-4 w-4 text-primary" /> Phone Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="rounded-xl border-border bg-background focus:ring-primary/20 font-body"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground font-body">
            <Info className="h-4 w-4 text-primary" /> Bio / About
          </label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us a bit about yourself..."
            rows={4}
            className="rounded-xl border-border bg-background focus:ring-primary/20 font-body resize-none"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[140px] rounded-xl gradient-navy text-primary-foreground shadow-lg hover:opacity-90 font-body font-semibold transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
