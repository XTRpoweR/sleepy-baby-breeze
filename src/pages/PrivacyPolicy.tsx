import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Shield, Eye, Lock, Download } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                  alt="SleepyBabyy Logo" 
                  className="h-8 w-8"
                />
                <span className="text-xl font-semibold text-gray-900">{t('app.name')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button onClick={() => navigate('/contact')} variant="outline">
                Questions?
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your privacy is our priority. Here's how we protect your family's data.
            </p>
            <p className="text-gray-500">
              Last updated: December 13, 2024
            </p>
          </div>
        </section>

        {/* Privacy Highlights */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
                  <p className="text-gray-600">Your data is encrypted both in transit and at rest</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Data Selling</h3>
                  <p className="text-gray-600">We never sell or share your personal information</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Data Portability</h3>
                  <p className="text-gray-600">Export your data anytime in standard formats</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-12">
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      We collect information you provide directly to us, such as when you create an account, 
                      track your baby's activities, or contact our support team.
                    </p>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Personal Information includes:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Account information (name, email address)</li>
                        <li>Baby profile information (name, birth date, photos you choose to upload)</li>
                        <li>Activity data (sleep times, feeding records, notes)</li>
                        <li>Device information for app functionality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      We use the information we collect to provide, maintain, and improve our services, 
                      including generating personalized insights and recommendations for your baby's sleep patterns.
                    </p>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">We use your data to:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Provide the SleepyBaby app and its features</li>
                        <li>Generate sleep pattern insights and recommendations</li>
                        <li>Enable family sharing and collaboration features</li>
                        <li>Provide customer support and respond to your requests</li>
                        <li>Improve our services and develop new features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      We do not sell, trade, or otherwise transfer your personal information to third parties. 
                      Your baby's data belongs to you and remains private.
                    </p>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Limited sharing occurs only when:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>You explicitly invite family members to access your baby's data</li>
                        <li>Required by law or to protect our legal rights</li>
                        <li>With service providers who assist in app functionality (under strict data protection agreements)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      We implement robust security measures to protect your information, including encryption, 
                      secure servers, and regular security audits.
                    </p>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Security measures include:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>256-bit SSL encryption for all data transmission</li>
                        <li>Encrypted database storage</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Multi-factor authentication options</li>
                        <li>SOC 2 Type II compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      You have control over your personal information and can exercise various rights 
                      regarding your data.
                    </p>
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Your rights include:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Access and download your data at any time</li>
                        <li>Correct or update your information</li>
                        <li>Delete your account and associated data</li>
                        <li>Control family sharing permissions</li>
                        <li>Opt out of non-essential communications</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      SleepyBaby is designed for parents and caregivers to track their babies' activities. 
                      We do not knowingly collect personal information from children under 13.
                    </p>
                    <p>
                      All baby profile information is controlled by the parent or guardian who created the account. 
                      We implement additional safeguards for any information about children.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Data Transfers</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      If you're located outside the United States, please note that we may transfer your 
                      information to and process it in the United States and other countries.
                    </p>
                    <p>
                      We ensure appropriate safeguards are in place for international transfers, 
                      including standard contractual clauses approved by relevant authorities.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      We may update this privacy policy from time to time. We will notify you of any 
                      material changes by email or through the app.
                    </p>
                    <p>
                      Your continued use of SleepyBaby after any changes indicates your acceptance 
                      of the updated privacy policy.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>
                      If you have any questions about this privacy policy or our data practices, 
                      please contact us:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p><strong>Email:</strong> support@sleepybabyy.com</p>
                      <p><strong>Address:</strong> SleepyBabyy Privacy Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Questions About Our Privacy Policy?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We're committed to transparency and protecting your family's privacy. 
              Contact us if you need clarification on anything.
            </p>
            <Button size="lg" onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Privacy Team
            </Button>
          </div>
        </section>
      </ScrollArea>
    </div>
  );
};

export default PrivacyPolicy;
