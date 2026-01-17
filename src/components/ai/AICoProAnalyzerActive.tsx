import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Upload, Loader2, TrendingUp, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAICredits } from '@/hooks/useAICredits';
import { supabase } from '@/integrations/supabase/client';
import { UpgradeModal } from './UpgradeModal';
import { useAuth } from '@/contexts/AuthContext';

interface AICoProAnalyzerActiveProps {
  userPlan: string;
}

interface AnalysisResult {
  priceDirection: string;
  probability: number;
  volatility: string;
  newsThreats: string[];
  tradeSetup: {
    entry: string;
    tp: string;
    sl: string;
    riskReward: string;
  };
  reasoning: string;
}

export const AICoProAnalyzerActive = ({ userPlan }: AICoProAnalyzerActiveProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [marketContext, setMarketContext] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { credits, hasEnoughCredits, fetchCredits } = useAICredits();
  const { user } = useAuth();

  const CREDIT_COST = 0; // Now free for all users

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG, JPG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to upload images.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setScreenshotUrl(urlData.publicUrl);
        setPreviewImage(urlData.publicUrl);
        toast({
          title: "Image Uploaded",
          description: "Your chart screenshot is ready for analysis.",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setScreenshotUrl('');
    setPreviewImage(null);
  };

  const handleAnalyze = async () => {
    if (!screenshotUrl && !marketContext) {
      toast({
        title: "Input Required",
        description: "Please provide a screenshot or market context to analyze.",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-copro-analyzer', {
        body: { 
          screenshotUrl,
          marketContext,
          creditsRequired: CREDIT_COST,
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || data?.message || 'Failed to get analysis');
      }

      setAnalysis(data.analysis);
      await fetchCredits();
      
      toast({
        title: "Analysis Complete! 🎯",
        description: "Your AI Co-Pro analysis is ready.",
      });
    } catch (error) {
      console.error('AI Co-Pro error:', error);
      
      let errorMessage = "Failed to analyze. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('credits') || error.message.includes('Insufficient')) {
          setShowUpgradeModal(true);
          errorMessage = "Insufficient credits. Please upgrade to continue.";
        } else if (error.message.includes('rate') || error.message.includes('429')) {
          errorMessage = "Rate limit reached. Please wait a moment and try again.";
        } else if (error.message.includes('402')) {
          errorMessage = "Payment required. Please add credits to continue.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-amber-500/5">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-amber-500 flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent truncate">
                  AI Co-Pro Analyzer
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Advanced market analysis with AI-powered trade setups
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="self-start sm:self-auto flex-shrink-0">
              {CREDIT_COST} credits
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
          {/* Image Upload Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Chart Screenshot
            </label>
            
            {previewImage ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img 
                  src={previewImage} 
                  alt="Chart preview" 
                  className="w-full max-h-48 sm:max-h-64 object-contain bg-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-muted">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Click to upload chart screenshot</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max 5MB)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Market Context */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Market Context (optional)
            </label>
            <Textarea
              placeholder="Describe the current market situation, pair, timeframe, and any relevant context..."
              value={marketContext}
              onChange={(e) => setMarketContext(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 hover:from-blue-700 hover:via-purple-700 hover:to-amber-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                <span className="text-sm sm:text-base">Analyzing Market...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Analyze with AI ({CREDIT_COST} credits)</span>
              </>
            )}
          </Button>

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-6 space-y-4 pt-6 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                    <CardTitle className="text-xs sm:text-sm flex items-center">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-primary" />
                      Price Direction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <p className="text-xl sm:text-2xl font-bold">{analysis.priceDirection}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Probability: {analysis.probability}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                    <CardTitle className="text-xs sm:text-sm flex items-center">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500" />
                      Volatility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <p className="text-xl sm:text-2xl font-bold">{analysis.volatility}</p>
                  </CardContent>
                </Card>
              </div>

              {analysis.newsThreats.length > 0 && (
                <Card>
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="text-xs sm:text-sm">News Threats</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <ul className="space-y-1.5 sm:space-y-2">
                      {analysis.newsThreats.map((threat, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/50">
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <CardTitle className="text-sm sm:text-base">Recommended Trade Setup</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Entry</p>
                      <p className="font-semibold text-sm sm:text-base">{analysis.tradeSetup.entry}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Risk:Reward</p>
                      <p className="font-semibold text-sm sm:text-base text-primary">{analysis.tradeSetup.riskReward}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Take Profit</p>
                      <p className="font-semibold text-sm sm:text-base text-green-500">{analysis.tradeSetup.tp}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Stop Loss</p>
                      <p className="font-semibold text-sm sm:text-base text-red-500">{analysis.tradeSetup.sl}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs sm:text-sm font-medium mb-2">Analysis Reasoning:</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {analysis.reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="credits"
      />
    </>
  );
};
