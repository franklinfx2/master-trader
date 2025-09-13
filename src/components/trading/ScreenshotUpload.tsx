import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ScreenshotUploadProps {
  screenshots: string[];
  onScreenshotsChange: (screenshots: string[]) => void;
  disabled?: boolean;
}

export const ScreenshotUpload = ({ screenshots, onScreenshotsChange, disabled }: ScreenshotUploadProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onScreenshotsChange([...screenshots, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    onScreenshotsChange(newScreenshots);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Trade Screenshots</label>
        <Badge variant="outline" className="text-xs">
          {screenshots.length}/5 uploaded
        </Badge>
      </div>

      {/* Upload Button */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="screenshot-upload"
          disabled={disabled || screenshots.length >= 5}
        />
        <label 
          htmlFor="screenshot-upload" 
          className={`cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-violet/10">
              <Camera className="w-6 h-6 text-violet" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {screenshots.length >= 5 ? 'Maximum screenshots reached' : 'Upload trade screenshots'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 5MB each (max 5 files)
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