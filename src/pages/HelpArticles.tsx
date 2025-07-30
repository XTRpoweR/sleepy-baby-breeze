
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Book, Clock, User } from "lucide-react";

const HelpArticles = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Article data based on category
  const getArticlesData = (category: string) => {
    const articlesData = {
      'getting-started': {
        title: 'Getting Started',
        description: 'Learn the basics of SleepyBaby',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        articles: [
          {
            id: 1,
            title: 'How to create your first baby profile',
            description: 'Step-by-step guide to setting up your baby\'s profile with all essential information.',
            readTime: '3 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Quick setup guide for new parents',
            description: 'Get started in under 5 minutes with our comprehensive quick setup process.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Understanding the dashboard layout',
            description: 'Navigate through your baby\'s dashboard and understand all the key features.',
            readTime: '4 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 4,
            title: 'Setting up your first sleep schedule',
            description: 'Create and customize sleep schedules that work for your baby\'s routine.',
            readTime: '6 min read',
            author: 'SleepyBaby Team'
          }
        ]
      },
      'family-sharing': {
        title: 'Family Sharing',
        description: 'Add family members and caregivers',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        articles: [
          {
            id: 1,
            title: 'Inviting family members to collaborate',
            description: 'Learn how to invite parents, grandparents, and caregivers to help track your baby.',
            readTime: '4 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Managing family member permissions',
            description: 'Control what each family member can see and edit in your baby\'s profile.',
            readTime: '3 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Setting up caregiver access',
            description: 'Give babysitters and daycare providers the right level of access.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          }
        ]
      },
      'reports-analytics': {
        title: 'Reports & Analytics',
        description: 'Understanding your baby\'s patterns',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        articles: [
          {
            id: 1,
            title: 'Understanding sleep pattern charts',
            description: 'Learn how to read and interpret your baby\'s sleep analytics and trends.',
            readTime: '7 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Exporting your baby\'s data',
            description: 'Download and share your baby\'s activity reports with pediatricians.',
            readTime: '3 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Weekly and monthly report summaries',
            description: 'Get insights from comprehensive weekly and monthly activity summaries.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          }
        ]
      },
      'billing-subscriptions': {
        title: 'Billing & Subscriptions',
        description: 'Manage your premium subscription',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        articles: [
          {
            id: 1,
            title: 'Understanding premium features',
            description: 'Learn about all the premium features available with your subscription.',
            readTime: '4 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Managing your subscription',
            description: 'How to upgrade, downgrade, or cancel your subscription plan.',
            readTime: '3 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Billing and payment issues',
            description: 'Troubleshoot common billing problems and update payment methods.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          }
        ]
      },
      'sounds-sleep': {
        title: 'Sounds & Sleep',
        description: 'Using our sound library effectively',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        articles: [
          {
            id: 1,
            title: 'Choosing the right sounds for sleep',
            description: 'Discover which sounds work best for different sleep situations.',
            readTime: '6 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Setting up audio timers',
            description: 'Learn how to schedule sounds to play automatically at specific times.',
            readTime: '4 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Creating custom sound playlists',
            description: 'Build personalized playlists for different activities and moods.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          }
        ]
      },
      'account-settings': {
        title: 'Account Settings',
        description: 'Customize your app experience',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        articles: [
          {
            id: 1,
            title: 'Setting up smart notifications',
            description: 'Configure notifications that help you stay on top of your baby\'s routine.',
            readTime: '5 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 2,
            title: 'Customizing your dashboard',
            description: 'Personalize your dashboard layout and choose which widgets to display.',
            readTime: '4 min read',
            author: 'SleepyBaby Team'
          },
          {
            id: 3,
            title: 'Privacy and security settings',
            description: 'Manage your privacy preferences and secure your account.',
            readTime: '6 min read',
            author: 'SleepyBaby Team'
          }
        ]
      }
    };

    return articlesData[category] || {
      title: 'Help Articles',
      description: 'Find helpful information',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      articles: []
    };
  };

  const categoryData = getArticlesData(categoryName || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Conditional Headers */}
      {user ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <>
          {/* Non-authenticated Desktop Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                    alt="SleepyBabyy Logo" 
                    className="h-12 w-auto"
                  />
                  <span className="text-xl font-bold text-gray-900">SleepyBabyy</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                  <LanguageSelector />
                  <Button variant="outline" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Non-authenticated Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 lg:hidden">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" 
                  alt="SleepyBabyy Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <Button size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/help')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Help Center</span>
            </Button>
          </div>

          {/* Category Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex p-4 rounded-2xl ${categoryData.bgColor} mb-6`}>
              <Book className={`h-12 w-12 ${categoryData.color}`} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {categoryData.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              {categoryData.description}
            </p>
            <Badge variant="secondary" className="text-sm">
              {categoryData.articles.length} articles
            </Badge>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {categoryData.articles.length > 0 ? (
            <div className="space-y-6">
              {categoryData.articles.map((article) => (
                <Card key={article.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {article.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                        </div>
                      </div>
                      <Book className={`h-8 w-8 ${categoryData.color} ml-4 flex-shrink-0`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600">Articles for this category are coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Need More Help Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/tutorial')} className="border-white text-white hover:bg-white hover:text-blue-600">
              Try Tutorial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpArticles;
