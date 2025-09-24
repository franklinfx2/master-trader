import { useAuth } from '@/contexts/AuthContext';
import Landing from './Landing';

const Index = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Landing />;
};

export default Index;
