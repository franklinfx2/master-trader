// This is a placeholder page for the webhook endpoint
// The actual webhook processing is handled by the Supabase Edge Function
// at /functions/paystack-webhook which will be accessible at:
// https://strat-guru.lovable.app/webhook

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Webhook() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect users who accidentally navigate to this page
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Webhook Endpoint</h1>
        <p className="text-muted-foreground mb-4">
          This page is for webhook processing only. Redirecting you to the dashboard...
        </p>
      </div>
    </div>
  );
}