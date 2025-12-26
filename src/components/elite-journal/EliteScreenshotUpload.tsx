// Elite Trade Screenshot Upload - Single mandatory screenshot field
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Eye, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface EliteScreenshotUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  error?: string;
}

export const EliteScreenshotUpload = ({ 
  label, 
  value, 
  onChange, 
  required = true,
  error 
}: EliteScreenshotUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/') || 
        !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PNG, JPG, or JPEG files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/elite/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Generate signed URL (valid for 5 years)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(data.path, 157680000);

      if (urlError || !signedUrlData) {
        toast({
          title: "Upload failed",
          description: "Failed to generate URL.",
          variant: "destructive",
        });
        return;
      }

      onChange(signedUrlData.signedUrl);
      toast({
        title: "Screenshot uploaded",
        description: `${label} uploaded successfully.`,
      });
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Upload error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeScreenshot = async () => {
    if (value && value.includes('supabase') && user) {
      try {
        const urlParts = value.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0];
        const filePath = `${user.id}/elite/${fileName}`;
        
        await supabase.storage
          .from('screenshots')
          .remove([filePath]);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    onChange('');
  };

  const hasValue = Boolean(value);
  const inputId = `screenshot-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
          {hasValue ? (
            <CheckCircle className="w-4 h-4 text-profit" />
          ) : (
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          )}
        </label>
      </div>

      {!hasValue ? (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            error ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileUpload}
            className="hidden"
            id={inputId}
            disabled={uploading}
          />
          <label 
            htmlFor={inputId} 
            className={cn(
              "cursor-pointer flex flex-col items-center gap-2",
              uploading && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="p-2 rounded-full bg-primary/10">
              {uploading ? (
                <Upload className="w-5 h-5 text-primary animate-pulse" />
              ) : (
                <Camera className="w-5 h-5 text-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </span>
          </label>
        </div>
      ) : (
        <Card className="relative group overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video relative">
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{label}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-auto">
                      <img src={value} alt={label} className="w-full h-auto" />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500/80 hover:bg-red-500 text-white border-0"
                  onClick={removeScreenshot}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
