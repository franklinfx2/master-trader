// Elite Trade Entry Page
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EliteTradeEntryForm } from '@/components/elite-journal/EliteTradeEntryForm';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

const EliteTradeEntry = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/elite-journal-debug');
  };

  return (
    <ResponsiveLayout>
      <div className="container-responsive max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Log Elite Trade</h1>
            <p className="text-sm text-muted-foreground">XAUUSD Professional Trading Journal</p>
          </div>
        </div>

        {/* Form */}
        <EliteTradeEntryForm onSuccess={handleSuccess} />
      </div>
    </ResponsiveLayout>
  );
};

export default EliteTradeEntry;
