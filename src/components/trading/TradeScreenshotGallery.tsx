import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeScreenshotGalleryProps {
  screenshots: string[];
  pair: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const TradeScreenshotGallery = ({
  screenshots,
  pair,
  isOpen,
  onClose,
  initialIndex = 0,
}: TradeScreenshotGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when gallery opens with new initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1));
  }, [screenshots.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0));
  }, [screenshots.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  if (screenshots.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              Trade Screenshots - {pair}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex flex-col">
          {/* Main Image Display */}
          <div className="relative flex items-center justify-center bg-background/50 min-h-[300px] max-h-[60vh]">
            {/* Previous Button */}
            {screenshots.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Current Image */}
            <img
              src={screenshots[currentIndex]}
              alt={`Screenshot ${currentIndex + 1} of ${screenshots.length} for ${pair} trade`}
              className="max-w-full max-h-[60vh] object-contain p-4"
            />

            {/* Next Button */}
            {screenshots.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Image Counter */}
          {screenshots.length > 1 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              {currentIndex + 1} of {screenshots.length}
            </div>
          )}

          {/* Thumbnail Strip */}
          {screenshots.length > 1 && (
            <div className="flex justify-center gap-2 p-4 pt-0 overflow-x-auto">
              {screenshots.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                    currentIndex === index
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component: Thumbnail preview row for trade cards
interface ScreenshotThumbnailsProps {
  screenshots: string[];
  maxVisible?: number;
  onThumbnailClick: (index: number) => void;
  size?: 'sm' | 'md';
}

export const ScreenshotThumbnails = ({
  screenshots,
  maxVisible = 3,
  onThumbnailClick,
  size = 'md',
}: ScreenshotThumbnailsProps) => {
  if (screenshots.length === 0) return null;

  const visibleScreenshots = screenshots.slice(0, maxVisible);
  const remainingCount = screenshots.length - maxVisible;

  const sizeClasses = size === 'sm' 
    ? 'w-10 h-10' 
    : 'w-14 h-14';

  return (
    <div className="flex items-center gap-2">
      {visibleScreenshots.map((url, index) => (
        <button
          key={index}
          onClick={() => onThumbnailClick(index)}
          className={cn(
            sizeClasses,
            "flex-shrink-0 rounded-md overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-105"
          )}
        >
          <img
            src={url}
            alt={`Screenshot ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
      {remainingCount > 0 && (
        <button
          onClick={() => onThumbnailClick(maxVisible)}
          className={cn(
            sizeClasses,
            "flex-shrink-0 rounded-md bg-muted/50 border border-border/50 hover:border-primary/50 transition-all flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
};
