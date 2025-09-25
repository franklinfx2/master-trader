import { Layout } from '@/components/Layout';

export default function Disclaimer() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Disclaimer</h1>
          
          <div className="bg-card rounded-lg p-6 border">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive font-semibold">
                ⚠️ Important Risk Warning
              </p>
              <p className="text-muted-foreground mt-2">
                Trading carries significant financial risk. Users are fully responsible for their trading 
                decisions. We do not guarantee profits or success.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Trading Risks</h3>
                <p className="text-muted-foreground">
                  All forms of trading and investing carry substantial risk of loss. Past performance 
                  does not guarantee future results. You should never invest money you cannot afford to lose.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Financial Advice</h3>
                <p className="text-muted-foreground">
                  MasterTraderAI provides educational tools and analysis only. Nothing on this platform 
                  constitutes financial advice, investment recommendations, or trading signals.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">User Responsibility</h3>
                <p className="text-muted-foreground">
                  Users are solely responsible for their trading decisions, risk management, and any 
                  resulting profits or losses. Please consult with a qualified financial advisor before 
                  making investment decisions.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Guarantees</h3>
                <p className="text-muted-foreground">
                  We make no representations or warranties about the accuracy, completeness, or reliability 
                  of any information, analysis, or tools provided on this platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}