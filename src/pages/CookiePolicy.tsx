import { Layout } from '@/components/Layout';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Cookie Policy</h1>
          
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground leading-relaxed mb-6">
              We use cookies to improve your experience and analyze app usage. Cookies help us understand 
              how you interact with our platform so we can provide better service and features.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">What Are Cookies?</h3>
                <p className="text-muted-foreground">
                  Cookies are small text files stored on your device that help websites remember your 
                  preferences and improve your browsing experience.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">How We Use Cookies</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Remember your login status and preferences</li>
                  <li>Analyze how you use our platform to improve our services</li>
                  <li>Provide personalized trading insights and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Managing Cookies</h3>
                <p className="text-muted-foreground">
                  You can control cookies through your browser settings. However, disabling cookies 
                  may affect the functionality of our platform and your user experience.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Third-Party Cookies</h3>
                <p className="text-muted-foreground">
                  We may use third-party analytics services that place cookies on your device to help 
                  us understand user behavior and improve our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}