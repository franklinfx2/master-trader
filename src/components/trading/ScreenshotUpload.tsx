import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Eye, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ScreenshotUploadProps {
  screenshots: string[];
  onScreenshotsChange: (screenshots: string[]) => void;
}

export const ScreenshotUpload = ({ screenshots, onScreenshotsChange }: ScreenshotUploadProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    if (screenshots.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 5 screenshots per trade.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newScreenshots: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/') || 
            !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Please upload PNG, JPG, or JPEG files only.",
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum size is 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('screenshots')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          continue;
        }

        // Generate signed URL for private bucket (valid for 5 years)
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(data.path, 157680000); // 5 years in seconds

        if (urlError || !signedUrlData) {
          console.error('Error generating signed URL:', urlError);
          toast({
            title: "Upload failed",
            description: `Failed to generate URL for ${file.name}.`,
            variant: "destructive",
          });
          continue;
        }

        newScreenshots.push(signedUrlData.signedUrl);
      }

      if (newScreenshots.length > 0) {
        onScreenshotsChange([...screenshots, ...newScreenshots]);
        toast({
          title: "Upload successful",
          description: `${newScreenshots.length} screenshot(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeScreenshot = async (index: number) => {
    const screenshotUrl = screenshots[index];
    
    // If it's a Supabase storage URL, delete from storage
    if (screenshotUrl.includes('supabase') && user) {
      try {
        // Extract file path from URL
        const urlParts = screenshotUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user.id}/${fileName}`;
        
        await supabase.storage
          .from('screenshots')
          .remove([filePath]);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    onScreenshotsChange(newScreenshots);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Trade Screenshots</label>
        <Badge variant="outline" className="text-xs">
          {screenshots.length}/5 per trade
        </Badge>
      </div>

      {/* Upload Button */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="screenshot-upload"
          disabled={screenshots.length >= 5 || uploading}
        />
        <label 
          htmlFor="screenshot-upload" 
          className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-violet/10">
              {uploading ? (
                <Upload className="w-6 h-6 text-violet animate-pulse" />
              ) : (
                <Camera className="w-6 h-6 text-violet" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' :
                 screenshots.length >= 5 ? 'Maximum screenshots reached' : 
                 'Upload trade screenshots'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, JPEG up to 5MB each (max 5 files)
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Screenshot Grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {screenshots.map((screenshot, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={screenshot}
                    alt={`Trade screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => setPreviewImage(screenshot)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Trade Screenshot {index + 1}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-auto">
                          <img
                            src={screenshot}
                            alt={`Trade screenshot ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/80 hover:bg-red-500 text-white border-0"
                      onClick={() => removeScreenshot(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
