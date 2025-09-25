import { Layout } from '@/components/Layout';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground leading-relaxed">
              We respect your privacy and only collect essential information like your email address. 
              Your data is secure and not shared with third parties. We use industry-standard encryption 
              and security measures to protect your personal information.
            </p>
            
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h3>
                <p className="text-muted-foreground">
                  We only collect essential information such as your email address for account creation 
                  and communication purposes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h3>
                <p className="text-muted-foreground">
                  Your information is used solely to provide our trading analysis services and to 
                  communicate important updates about your account.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Security</h3>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your data and never 
                  share your personal information with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}