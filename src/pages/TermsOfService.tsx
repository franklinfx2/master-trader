import { Layout } from '@/components/Layout';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground leading-relaxed mb-6">
              By using MasterTraderAI, you agree to our terms. We provide educational trading tools only, 
              not financial advice. Our platform is designed to help you analyze your trading performance 
              and improve your skills through data-driven insights.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Educational Purpose</h3>
                <p className="text-muted-foreground">
                  MasterTraderAI provides educational tools and analysis for trading purposes. We do not 
                  provide financial advice or recommendations for specific trades.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">User Responsibility</h3>
                <p className="text-muted-foreground">
                  Users are responsible for their own trading decisions and should conduct their own 
                  research before making any financial investments.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  While we strive to maintain high availability, we cannot guarantee uninterrupted 
                  service and are not liable for any losses resulting from service interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}