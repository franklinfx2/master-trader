import { Layout } from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQ() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h1>
          
          <div className="bg-card rounded-lg border">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="px-6">
                <AccordionTrigger className="text-left">
                  How do I create an account?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Simply sign up with your email address on our registration page. You'll receive a 
                  confirmation email to verify your account and get started with MasterTraderAI.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="px-6">
                <AccordionTrigger className="text-left">
                  Do you provide financial advice?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No, we provide educational tools only. MasterTraderAI offers trading analysis and 
                  insights to help you learn and improve your trading skills, but we do not provide 
                  financial advice or specific trading recommendations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="px-6">
                <AccordionTrigger className="text-left">
                  How do I reset my password?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Use the "Forgot Password" link on the login page. Enter your email address and we'll 
                  send you instructions to reset your password securely.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="px-6">
                <AccordionTrigger className="text-left">
                  What trading markets do you support?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  MasterTraderAI supports analysis for various trading markets including forex, stocks, 
                  cryptocurrencies, and commodities. Our AI adapts to different market conditions and 
                  trading styles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="px-6">
                <AccordionTrigger className="text-left">
                  How does the AI analysis work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our AI analyzes your trading patterns, market conditions, and historical data to 
                  provide insights about your trading performance, risk management, and areas for 
                  improvement. The analysis is educational and helps you understand your trading behavior.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="px-6">
                <AccordionTrigger className="text-left">
                  Is my trading data secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we use industry-standard encryption and security measures to protect your data. 
                  Your trading information is stored securely and never shared with third parties.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </Layout>
  );
}