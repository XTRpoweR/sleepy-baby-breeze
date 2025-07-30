
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Mail, MessageCircle, Clock, Send, HelpCircle, Users, Briefcase, CheckCircle, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Contact = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        console.error('Error sending contact email:', error);
        throw error;
      }

      console.log('Contact form submitted successfully:', data);
      setIsSubmitted(true);
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Failed to send contact form:', error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again or email us directly at support@sleepybabyy.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-fade-in">
      {/* Conditional Navigation */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-1 sm:space-x-2 p-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                    alt="SleepyBabyy Logo" 
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  />
                  <span className="text-lg sm:text-xl font-semibold text-gray-900">{t('app.name')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:block">
                  <LanguageSelector />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Get in Touch
            <span className="text-blue-600 block">We're Here to Help</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
            Have questions about SleepyBabyy? Need support with your account? 
            Want to share feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="border-0 shadow-xl">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl">
                    {isSubmitted ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        <span>Message Sent Successfully!</span>
                      </div>
                    ) : (
                      "Send us a Message"
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {isSubmitted ? (
                      "Thank you for contacting us! We'll get back to you within 24 hours."
                    ) : (
                      "Fill out the form below and we'll get back to you within 24 hours."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {!isSubmitted && (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                          <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={e => handleInputChange('name', e.target.value)} 
                            placeholder="Your full name" 
                            required 
                            className="touch-target"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={e => handleInputChange('email', e.target.value)} 
                            placeholder="your.email@example.com" 
                            required 
                            className="touch-target"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={value => handleInputChange('category', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="touch-target">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiries</SelectItem>
                            <SelectItem value="press">Press & Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                        <Input 
                          id="subject" 
                          value={formData.subject} 
                          onChange={e => handleInputChange('subject', e.target.value)} 
                          placeholder="Brief description of your inquiry" 
                          required 
                          className="touch-target"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                        <Textarea 
                          id="message" 
                          value={formData.message} 
                          onChange={e => handleInputChange('message', e.target.value)} 
                          placeholder="Please provide details about your inquiry..." 
                          rows={6} 
                          required 
                          className="touch-target min-h-[120px] sm:min-h-[150px]"
                          disabled={isSubmitting}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-blue-600 hover:bg-blue-700 touch-target"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                  
                  {isSubmitted && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-6">
                        We've received your message and will respond within 24 hours. 
                        A confirmation email has been sent to your inbox.
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="mr-4"
                      >
                        Send Another Message
                      </Button>
                      <Button onClick={() => navigate('/')}>
                        Return to Home
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              {/* Contact Methods */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Email</div>
                      <div className="text-xs sm:text-sm text-gray-600 break-all">support@sleepybabyy.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Live Chat</div>
                      <div className="text-xs sm:text-sm text-gray-600">Available in the app</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Response Time</div>
                      <div className="text-xs sm:text-sm text-gray-600">Within 24 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Quick Help</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                  <Button variant="outline" className="w-full justify-start touch-target text-sm" onClick={() => navigate('/help')}>
                    <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Help Center & FAQ
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start touch-target text-sm" onClick={() => navigate('/family')}>
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    Family Sharing Help
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start touch-target text-sm" onClick={() => navigate('/subscription')}>
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    Subscription Support
                  </Button>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Support Hours</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span>Monday - Friday</span>
                      <span className="font-medium text-right">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Saturday</span>
                      <span className="font-medium text-right">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sunday</span>
                      <span className="font-medium text-right">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800">
                      Emergency support available 24/7 for Premium subscribers
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500 line-through">$14.99/month</span>
                      <span className="text-sm font-bold text-blue-800">$9.99/month (40% OFF)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                question: "How do I add family members?",
                answer: "Go to Family Sharing in your dashboard and send invitations via email. Family members can join with the invitation link."
              },
              {
                question: "Can I export my data?",
                answer: "Yes! Premium users can export all their data in CSV format from the Reports section."
              },
              {
                question: "Is my baby's data secure?",
                answer: "Absolutely. We use enterprise-grade encryption and never share personal data with third parties."
              },
              {
                question: "How do I cancel my subscription?",
                answer: "You can cancel anytime from your Account settings. Your data remains accessible until the end of your billing period."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{faq.question}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Button onClick={() => navigate('/help')} variant="outline" size="lg" className="touch-target">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
